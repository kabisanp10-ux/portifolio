import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'contact-form-backend',
      configureServer(server) {
        server.middlewares.use('/api/contact', async (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const data = JSON.parse(body || '{}');
                const dataDir = path.resolve(process.cwd(), 'data');
                if (!fs.existsSync(dataDir)) {
                  fs.mkdirSync(dataDir, { recursive: true });
                }
                const filePath = path.join(dataDir, 'contact_messages.json');
                let existing = [];
                if (fs.existsSync(filePath)) {
                  try {
                    existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                  } catch (e) {
                    existing = [];
                  }
                }
                const newSubmission = {
                  id: 'msg_' + Date.now(),
                  timestamp: new Date().toISOString(),
                  name: data.name || '',
                  email: data.email || '',
                  subject: data.subject || '',
                  message: data.message || ''
                };
                existing.unshift(newSubmission);
                fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');

                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(
                  JSON.stringify({
                    success: true,
                    message: 'Contact submission saved successfully',
                    submission: newSubmission
                  })
                );
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
              }
            });
          } else if (req.method === 'GET') {
            const filePath = path.resolve(process.cwd(), 'data', 'contact_messages.json');
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            if (fs.existsSync(filePath)) {
              res.end(fs.readFileSync(filePath, 'utf-8'));
            } else {
              res.end(JSON.stringify([]));
            }
          } else {
            res.writeHead(405);
            res.end();
          }
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  }
});
