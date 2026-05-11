import { NextResponse } from 'next/server';
import { exportWorkspace } from '@/lib/export/workspaceExport';

export const dynamic = 'force-dynamic';

export async function GET() {
  const bundle = exportWorkspace();
  return NextResponse.json(bundle);
}
