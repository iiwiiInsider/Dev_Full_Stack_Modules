import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateRentalMandatePdf } from './src/pdf/generateRentalMandate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/rental-mandate', async (req, res) => {
  try {
    const data = req.body;
    // Basic validation
    const required = [
      'property.address',
      'property.type',
      'landlord.name',
      'agent.name',
      'agency.name',
      'rental.monthlyRent'
    ];
    for (const field of required) {
      const parts = field.split('.');
      let cursor = data;
      for (const p of parts) cursor = cursor?.[p];
      if (!cursor) {
        console.warn('Validation failed - missing field:', field, 'payload keys:', Object.keys(data || {}));
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    const { stream, filename } = await generateRentalMandatePdf(data);

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Rentals Mandate Creator server listening on port ${PORT}`));
