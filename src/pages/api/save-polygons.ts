import type { APIRoute } from 'astro';
import { writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

// Dev-only endpoint: writes the polygon JSON sent by the helper directly to
// src/data/floor-plans.json (and mirrors to public/data/ so the helper can
// reload). Refuses to run in a production build to avoid arbitrary writes.

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) {
    return new Response(JSON.stringify({ error: 'dev-only endpoint' }), { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 });
  }

  // Light schema check.
  const data = payload as {
    image_width?: number;
    image_height?: number;
    floors?: Array<{ floor: number; image: string; apartments: Array<{ number: number; polygon: string }> }>;
  };
  if (!data || typeof data.image_width !== 'number' || !Array.isArray(data.floors)) {
    return new Response(JSON.stringify({ error: 'unexpected shape' }), { status: 400 });
  }
  for (const f of data.floors) {
    if (typeof f.floor !== 'number' || !Array.isArray(f.apartments)) {
      return new Response(JSON.stringify({ error: 'bad floor entry' }), { status: 400 });
    }
    for (const a of f.apartments) {
      if (typeof a.number !== 'number' || typeof a.polygon !== 'string' || a.polygon.length < 7) {
        return new Response(JSON.stringify({ error: `bad apt ${a?.number}` }), { status: 400 });
      }
    }
  }

  const json = JSON.stringify(data, null, 2) + '\n';
  const cwd = process.cwd();
  const srcPath    = resolve(cwd, 'src/data/floor-plans.json');
  const publicPath = resolve(cwd, 'public/data/floor-plans.json');

  // 1. Backup the EXISTING file BEFORE we overwrite it.
  let backupPath: string | null = null;
  try {
    await access(srcPath);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    backupPath = resolve(cwd, `src/data/.floor-plans.${stamp}.bak.json`);
    await copyFile(srcPath, backupPath);
  } catch { /* file didn't exist yet — no backup needed */ }

  // 2. Write the new content.
  await mkdir(dirname(publicPath), { recursive: true });
  await writeFile(srcPath, json, 'utf-8');
  await writeFile(publicPath, json, 'utf-8');

  const counts = data.floors.map((f) => ({ floor: f.floor, n: f.apartments.length }));
  return new Response(JSON.stringify({ ok: true, counts, backup: backupPath }), { status: 200 });
};
