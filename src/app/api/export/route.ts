import { NextResponse } from 'next/server';
import { exportWorkspace } from '@/lib/export/workspaceExport';
import { apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bundle = exportWorkspace();
    return NextResponse.json(bundle);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '导出失败', 500);
  }
}
