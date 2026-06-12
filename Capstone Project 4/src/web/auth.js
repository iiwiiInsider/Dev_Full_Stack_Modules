import express from 'express';
import axios from 'axios';
import qs from 'qs';
import { nanoid } from 'nanoid';

const router = express.Router();

const authority = `https://login.microsoftonline.com/${process.env.AZURE_TENANT || 'common'}`;
const authorizeUrl = `${authority}/oauth2/v2.0/authorize`;
const tokenUrl = `${authority}/oauth2/v2.0/token`;

function ensureAuth(req, res, next) {
  if (!req.session.tokens || !req.session.tokens.access_token) {
    return res.redirect('/login');
  }
  next();
}

router.get('/login', (req, res) => {
  if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
    return res.status(500).render('config', {
      title: 'Configure Microsoft Sign-in',
      authed: false,
      config: {
        tenant: process.env.AZURE_TENANT || 'common',
        clientId: Boolean(process.env.AZURE_CLIENT_ID),
        clientSecret: Boolean(process.env.AZURE_CLIENT_SECRET),
        redirectUri: process.env.AZURE_REDIRECT_URI || 'http://localhost:3000/auth/callback',
        scopes: process.env.AZURE_SCOPES || 'offline_access Files.Read'
      }
    });
  }
  const state = nanoid();
  req.session.oauthState = state;
  const params = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID || '',
    response_type: 'code',
    redirect_uri: process.env.AZURE_REDIRECT_URI || 'http://localhost:3000/auth/callback',
    response_mode: 'query',
    scope: (process.env.AZURE_SCOPES || 'offline_access Files.Read').split(' ').join(' '),
    state
  });
  res.redirect(`${authorizeUrl}?${params.toString()}`);
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

router.get('/auth/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;
  if (error) return res.status(400).send(`${error}: ${error_description}`);
  if (!code || state !== req.session.oauthState) return res.status(400).send('Invalid auth state.');

  try {
    const body = qs.stringify({
      client_id: process.env.AZURE_CLIENT_ID,
      client_secret: process.env.AZURE_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.AZURE_REDIRECT_URI,
      scope: process.env.AZURE_SCOPES
    });

    const tokenResp = await axios.post(tokenUrl, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    req.session.tokens = tokenResp.data; // { access_token, refresh_token, expires_in, ... }
    res.redirect('/');
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).send('Token exchange failed.');
  }
});

async function refreshToken(req) {
  if (!req.session?.tokens?.refresh_token) return;
  try {
    const body = qs.stringify({
      client_id: process.env.AZURE_CLIENT_ID,
      client_secret: process.env.AZURE_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: req.session.tokens.refresh_token,
      scope: process.env.AZURE_SCOPES
    });
    const tokenResp = await axios.post(tokenUrl, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    req.session.tokens = { ...req.session.tokens, ...tokenResp.data };
  } catch (e) {
    console.error('Refresh failed', e.response?.data || e.message);
  }
}

export { ensureAuth, refreshToken };
export default router;
