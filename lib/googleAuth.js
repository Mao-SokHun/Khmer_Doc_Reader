import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

export async function verifyGoogleIdToken(idToken) {
  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  if (!clientId) {
    const error = new Error('GOOGLE_AUTH_NOT_CONFIGURED');
    error.code = 'GOOGLE_AUTH_NOT_CONFIGURED';
    throw error;
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub) throw new Error('INVALID_GOOGLE_TOKEN');

  return {
    ownerId: `google:${payload.sub}`,
    email: payload.email || '',
    name: payload.name || payload.email || 'User',
    picture: payload.picture || '',
  };
}
