import { apiError, apiResponse } from '@/lib/api/response';
import {
  deleteCustomTemplate,
  getCustomTemplate,
  updateCustomTemplate,
} from '@/lib/templates/customStore';
import { NextRequest } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const template = getCustomTemplate(id);
    if (!template) {
      return apiError('Template not found', 404);
    }
    return apiResponse(template);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Failed to fetch template', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateCustomTemplate(id, body);
    if (!updated) {
      return apiError('Template not found', 404);
    }
    return apiResponse(updated);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Failed to update template', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = deleteCustomTemplate(id);
    if (!deleted) {
      return apiError('Template not found', 404);
    }
    return apiResponse({ deleted: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Failed to delete template', 500);
  }
}
