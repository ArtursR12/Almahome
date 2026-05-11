import type { APIRoute } from 'astro';
import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import { checkBasicAuth } from '@/middleware';

export const prerender = false;

// Polygon: 3+ "x,y" pairs separated by whitespace. Empty string = "not drawn
// yet", which the editor accepts so newly-seeded spots can be saved iteratively.
const polygonString = z.string().refine((s) => {
  if (s.trim() === '') return true;
  const pairs = s.trim().split(/\s+/);
  if (pairs.length < 3) return false;
  return pairs.every((p) => /^\d+(?:\.\d+)?,\d+(?:\.\d+)?$/.test(p));
}, 'polygon must be empty or ≥3 "x,y" pairs');

const SaveSchema = z.object({
  image: z.string().min(1),
  image_width: z.number().int().positive(),
  image_height: z.number().int().positive(),
  spots: z
    .array(
      z.object({
        number: z.number().int().min(1).max(23),
        polygon: polygonString,
      }),
    )
    .length(23),
});

export const POST: APIRoute = async ({ request }) => {
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

  const parsed = SaveSchema.safeParse(raw);
  if (!parsed.success) {
    console.error('[admin/save-parking-polygons] validation failed:', parsed.error.format());
    return Response.json({ error: 'Validation failed' }, { status: 400 });
  }

  const token = import.meta.env.GITHUB_TOKEN;
  const owner = import.meta.env.GITHUB_OWNER;
  const repo = import.meta.env.GITHUB_REPO;
  if (!token || !owner || !repo) {
    console.error('[admin/save-parking-polygons] Missing GitHub env');
    return Response.json({ error: 'GitHub integration not configured' }, { status: 500 });
  }

  const path = 'src/data/parking-spots.json';
  const octokit = new Octokit({ auth: token });

  try {
    const current = await octokit.rest.repos.getContent({ owner, repo, path });
    if (Array.isArray(current.data) || current.data.type !== 'file') {
      return Response.json({ error: 'parking-spots.json not found in repo' }, { status: 404 });
    }

    const newContent = JSON.stringify(parsed.data, null, 2) + '\n';
    const contentB64 = Buffer.from(newContent, 'utf-8').toString('base64');

    const commit = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: 'admin: update parking spot polygons',
      content: contentB64,
      sha: current.data.sha,
      branch: 'main',
    });

    console.log(
      `[admin/save-parking-polygons] committed sha=${commit.data.commit.sha?.slice(0, 7)}`,
    );
    return Response.json({ ok: true, commitSha: commit.data.commit.sha }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown';
    console.error('[admin/save-parking-polygons] GitHub API error:', msg);
    if (msg.includes('Bad credentials') || msg.includes('401')) {
      return Response.json({ error: 'GitHub token invalid' }, { status: 500 });
    }
    return Response.json({ error: 'Failed to commit' }, { status: 500 });
  }
};
