import { Hono } from 'hono';
import { localhostGuard } from './middleware/localhostGuard.js';
import { rateLimit } from './middleware/rateLimit.js';
import { settingsRoutes } from './routes/settings.js';
import { draftsRoutes } from './routes/drafts.js';
import { agentRoutes } from './routes/agent.js';
import { publishRoutes } from './routes/publish.js';
import { syncTasksRoutes } from './routes/syncTasks.js';
import { customPromptsRoutes } from './routes/customPrompts.js';
import { templatesRoutes } from './routes/templates.js';
import { platformVariantsRoutes } from './routes/platformVariants.js';
import { platformsRoutes } from './routes/platforms.js';
import { uploadRoutes } from './routes/uploads.js';

export const app = new Hono();

app.use('*', localhostGuard);
app.use('*', rateLimit);

app.get('/api/health', (c) => c.json({ ok: true }));

app.route('/api/settings', settingsRoutes);
app.route('/api/drafts', draftsRoutes);
app.route('/api/agent', agentRoutes);
app.route('/api/publish', publishRoutes);
app.route('/api/sync-tasks', syncTasksRoutes);
app.route('/api/custom-prompts', customPromptsRoutes);
app.route('/api/templates', templatesRoutes);
app.route('/api/platform-variants', platformVariantsRoutes);
app.route('/api/platforms', platformsRoutes);
// upload routes register /upload, /uploads, /uploads/:filename at the /api root
app.route('/api', uploadRoutes);
