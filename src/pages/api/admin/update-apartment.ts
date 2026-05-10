import type { APIRoute } from 'astro';
import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import { checkBasicAuth } from '@/middleware';

export const prerender = false;

const UpdateSchema = z.object({
  number: z.number().int().min(1).max(24),
  status: z.enum(['available', 'reserved', 'sold']),
  price:  z.number().positive().nullable(),
});

export const POST: APIRoute = async ({ request }) => {
  // Defence in depth — middleware already gates /api/admin, but never trust
  // that alone in case of a routing change.
  if (!checkBasicAuth(request.headers.get('authorization'))) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="AlmaHome Admin"' },
    });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed' }, { status: 400 });
  }
  const { number, status, price } = parsed.data;

  const token = import.meta.env.GITHUB_TOKEN;
  const owner = import.meta.env.GITHUB_OWNER;
  const repo  = import.meta.env.GITHUB_REPO;
  if (!token || !owner || !repo) {
    console.error('[admin/update-apartment] Missing GitHub env (GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO)');
    return Response.json({ error: 'GitHub integration not configured' }, { status: 500 });
  }

  const padded = String(number).padStart(2, '0');
  const path = `src/content/apartments/apt-${padded}.json`;
  const octokit = new Octokit({ auth: token });

  try {
    const current = await octokit.rest.repos.getContent({ owner, repo, path });
    if (Array.isArray(current.data) || current.data.type !== 'file') {
      return Response.json({ error: 'Apartment file not found' }, { status: 404 });
    }
    const sha = current.data.sha;
    const decoded = Buffer.from(current.data.content, 'base64').toString('utf-8');
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(decoded);
    } catch {
      console.error(`[admin/update-apartment] Existing file is not valid JSON: ${path}`);
      return Response.json({ error: 'Existing apartment file is corrupted' }, { status: 500 });
    }

    if (json.number !== number) {
      console.error(`[admin/update-apartment] Number mismatch: requested ${number}, file has ${json.number}`);
      return Response.json({ error: 'Apartment number mismatch' }, { status: 409 });
    }

    json.status = status;
    json.price = price;

    const newContent = JSON.stringify(json, null, 2) + '\n';
    const contentB64 = Buffer.from(newContent, 'utf-8').toString('base64');

    const commit = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `admin: update apt-${padded} status=${status}${price !== null ? ` price=${price}` : ''}`,
      content: contentB64,
      sha,
      branch: 'main',
    });

    console.log(`[admin/update-apartment] Committed apt-${padded}: status=${status} price=${price}  sha=${commit.data.commit.sha?.slice(0, 7)}`);
    return Response.json({ ok: true, commitSha: commit.data.commit.sha }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error(`[admin/update-apartment] GitHub API error for apt-${padded}:`, msg);
    if (msg.includes('Not Found')) {
      return Response.json({ error: 'Apartment file not found in repository' }, { status: 404 });
    }
    if (msg.includes('Bad credentials') || msg.includes('401')) {
      return Response.json({ error: 'GitHub token invalid' }, { status: 500 });
    }
    return Response.json({ error: 'Failed to update apartment' }, { status: 500 });
  }
};
