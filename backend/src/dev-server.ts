import { serve } from '@hono/node-server';
import app from './index';

const port = 8787;
console.log(`🚀 Cloth Shop Backend Edge API running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
