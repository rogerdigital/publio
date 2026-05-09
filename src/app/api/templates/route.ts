import { apiError, apiResponse } from '@/lib/api/response';
import { CONTENT_TEMPLATES } from '@/lib/templates';
import { createCustomTemplate, getAllCustomTemplates } from '@/lib/templates/customStore';
import { NextRequest } from 'next/server';

export async function GET() {
  try {
    const custom = getAllCustomTemplates();
    return apiResponse({ builtIn: CONTENT_TEMPLATES, custom });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Failed to fetch templates', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, title, content } = body;

    if (!name?.trim() || !content?.trim()) {
      return apiError('name and content are required');
    }

    const template = createCustomTemplate({
      name: name.trim(),
      description: description?.trim() || '',
      icon: icon || '📝',
      title: title || '',
      content,
    });

    return apiResponse(template, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Failed to create template', 500);
  }
}
