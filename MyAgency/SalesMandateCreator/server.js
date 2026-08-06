import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateMandatePdf } from './src/pdf/generateMandate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(helmet());
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/mandate', async (req, res) => {
  try {
    const data = req.body;
    // Basic validation
    const required = ['property.address', 'property.type', 'seller.name', 'agent.name', 'agency.name'];
    for (const field of required) {
      const parts = field.split('.');
      let cursor = data;
      for (const p of parts) cursor = cursor?.[p];
      if (!cursor) {
        console.warn('Validation failed - missing field:', field, 'payload keys:', Object.keys(data || {}));
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    const { stream, filename } = await generateMandatePdf(data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mandate Creator server listening on port ${PORT}`));
