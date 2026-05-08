import { NextRequest } from 'next/server';
import {
  getCustomSources,
  addCustomSource,
  updateCustomSource,
  deleteCustomSource,
} from '@/lib/rss-sources/store';
import { apiResponse, apiError } from '@/lib/api/response';

export async function GET() {
  return apiResponse({ sources: getCustomSources() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url } = body;

    if (!name?.trim() || !url?.trim()) {
      return apiError('名称和 URL 不能为空', 400);
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return apiError('URL 格式无效', 400);
    }

    const source = addCustomSource(name, url);
    return apiResponse({ source }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '服务器内部错误', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return apiError('缺少 id', 400);

    const source = updateCustomSource(id, updates);
    if (!source) return apiError('未找到该源', 404);

    return apiResponse({ source });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '服务器内部错误', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return apiError('缺少 id', 400);

    const deleted = deleteCustomSource(id);
    if (!deleted) return apiError('未找到该源', 404);

    return apiResponse({ deleted: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '服务器内部错误', 500);
  }
}
