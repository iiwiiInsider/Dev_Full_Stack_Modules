import express from 'express';
import axios from 'axios';
import { ensureAuth, refreshToken } from './auth.js';

const router = express.Router();

const GRAPH = 'https://graph.microsoft.com/v1.0';

function authHeader(req) {
  return { Authorization: `Bearer ${req.session.tokens.access_token}` };
}

router.get('/', async (req, res) => {
  const authed = Boolean(req.session.tokens?.access_token);
  res.render('index', { title: 'OneDrive Moodboard', authed });
});

// Creative idea: OneDrive Moodboard
// - After login, the app lists image files in the user's OneDrive (root and Pictures)
// - User can pick a folder to preview as a responsive CSS grid moodboard
// - Client uses Axios to call our endpoints; server calls MS Graph

router.get('/me', ensureAuth, async (req, res) => {
  try {
    await refreshToken(req);
    const me = await axios.get(`${GRAPH}/me`, { headers: authHeader(req) });
    res.json(me.data);
  } catch (e) {
    res.status(500).json({ error: e.response?.data || e.message });
  }
});

router.get('/api/drive/root', ensureAuth, async (req, res) => {
  try {
    await refreshToken(req);
    const items = await axios.get(`${GRAPH}/me/drive/root/children?$select=id,name,webUrl,folder,file,thumbnails`, { headers: authHeader(req) });
    res.json(items.data);
  } catch (e) {
    res.status(500).json({ error: e.response?.data || e.message });
  }
});

router.get('/api/drive/pictures', ensureAuth, async (req, res) => {
  try {
    await refreshToken(req);
    const items = await axios.get(`${GRAPH}/me/drive/special/photos/children?$select=id,name,webUrl,folder,file,thumbnails`, { headers: authHeader(req) });
    res.json(items.data);
  } catch (e) {
    res.status(500).json({ error: e.response?.data || e.message });
  }
});

router.get('/api/drive/:itemId/children', ensureAuth, async (req, res) => {
  try {
    await refreshToken(req);
    const { itemId } = req.params;
    const items = await axios.get(`${GRAPH}/me/drive/items/${itemId}/children?$select=id,name,webUrl,folder,file,thumbnails`, { headers: authHeader(req) });
    res.json(items.data);
  } catch (e) {
    res.status(500).json({ error: e.response?.data || e.message });
  }
});

// Simplified thumbnail route for moodboard tiles
router.get('/api/thumb/:itemId', ensureAuth, async (req, res) => {
  try {
    await refreshToken(req);
    const { itemId } = req.params;
    const thumbs = await axios.get(`${GRAPH}/me/drive/items/${itemId}/thumbnails`, { headers: authHeader(req) });
    const size = thumbs.data.value?.[0]?.large || thumbs.data.value?.[0]?.medium || thumbs.data.value?.[0]?.small;
    if (!size?.url) return res.status(404).send('No thumbnail');
    res.redirect(size.url);
  } catch (e) {
    res.status(500).send('thumb error');
  }
});

// User avatar (64x64) proxy
router.get('/api/avatar', ensureAuth, async (req, res) => {
  try {
    await refreshToken(req);
    const photo = await axios.get(`${GRAPH}/me/photos/64x64/$value`, {
      headers: authHeader(req),
      responseType: 'arraybuffer',
      validateStatus: s => s < 500
    });
    if (photo.status === 404) return res.status(204).end();
    res.setHeader('Content-Type', photo.headers['content-type'] || 'image/jpeg');
    res.send(Buffer.from(photo.data));
  } catch (e) {
    res.status(204).end();
  }
});

export default router;
