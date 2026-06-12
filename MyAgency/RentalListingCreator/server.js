import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateRentalPdf } from './src/pdf/generateRental.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/rental', async (req, res) => {
  try {
    const data = req.body;
    const required = [
      'property.address',
      'property.type',
      'rental.monthlyRent',
      'rental.deposit',
      'agent.name',
      'agency.name'
    ];
    for (const field of required) {
      const parts = field.split('.');
      let cursor = data;
      for (const p of parts) cursor = cursor?.[p];
      if (!cursor) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    const { stream, filename } = await generateRentalPdf(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Rental Listing Creator server listening on port ${PORT}`));
