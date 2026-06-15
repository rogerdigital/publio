import { serve } from '@hono/node-server';
import { app } from './app.js';

const port = Number(process.env.API_PORT || 8787);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Publio API listening on http://127.0.0.1:${info.port}`);
});
