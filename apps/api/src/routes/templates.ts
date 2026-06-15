import { Hono } from 'hono';
import { CONTENT_TEMPLATES } from '@/lib/templates';
import {
  createCustomTemplate,
  getAllCustomTemplates,
  getCustomTemplate,
  updateCustomTemplate,
  deleteCustomTemplate,
} from '@/lib/templates/customStore';
import { apiResponse, apiError } from '@/lib/response';

export const templatesRoutes = new Hono();

templatesRoutes.get('/', (c) => {
  try {
    const custom = getAllCustomTemplates();
    return apiResponse(c, { builtIn: CONTENT_TEMPLATES, custom });
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : 'Failed to fetch templates', 500);
  }
});

templatesRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, icon, title, content } = body;
    if (!name?.trim() || !content?.trim()) {
      return apiError(c, 'name and content are required');
    }
    const template = createCustomTemplate({
      name: name.trim(),
      description: description?.trim() || '',
      icon: icon || '📝',
      title: title || '',
      content,
    });
    return apiResponse(c, template, 201);
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : 'Failed to create template', 500);
  }
});

templatesRoutes.get('/:id', (c) => {
  try {
    const template = getCustomTemplate(c.req.param('id'));
    if (!template) return apiError(c, 'Template not found', 404);
    return apiResponse(c, template);
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : 'Failed to fetch template', 500);
  }
});

templatesRoutes.put('/:id', async (c) => {
  try {
    const body = await c.req.json();
    const updated = updateCustomTemplate(c.req.param('id'), body);
    if (!updated) return apiError(c, 'Template not found', 404);
    return apiResponse(c, updated);
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : 'Failed to update template', 500);
  }
});

templatesRoutes.delete('/:id', (c) => {
  try {
    const deleted = deleteCustomTemplate(c.req.param('id'));
    if (!deleted) return apiError(c, 'Template not found', 404);
    return apiResponse(c, { deleted: true });
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : 'Failed to delete template', 500);
  }
});
