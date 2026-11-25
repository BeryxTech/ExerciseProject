import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const ambienceDir = path.join(process.cwd(), 'public', 'Sounds', 'Ambience');

  try {
    const files = await fs.readdir(ambienceDir);
    const tracks = files
      .filter((file) => !file.startsWith('.'))
      .map((file) => `/Sounds/Ambience/${encodeURIComponent(file)}`);

    return NextResponse.json(tracks, { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}