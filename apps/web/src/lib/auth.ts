import { SignJWT, jwtVerify } from 'jose';
import { supabase } from './supabase';

const SECRET = new TextEncoder().encode(process.env.MAGIC_LINK_SECRET!);

export async function createMagicLinkToken(email: string): Promise<string> {
  const token = crypto.randomUUID();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await supabase.from('magic_link_tokens').insert({
    email,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  return token;
}

export async function verifyMagicLink(token: string, email: string): Promise<boolean> {
  const tokenHash = await hashToken(token);

  const { data, error } = await supabase
    .from('magic_link_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .eq('email', email)
    .eq('used', false)
    .single();

  if (error || !data) return false;
  if (new Date(data.expires_at) < new Date()) return false;

  // Mark as used
  await supabase.from('magic_link_tokens').update({ used: true }).eq('id', data.id);

  return true;
}

export async function createSession(email: string): Promise<string> {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);

  return token;
}

export async function verifySession(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { clockTolerance: 60 });
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function getOrCreateOwner(email: string) {
  const { data: existing } = await supabase
    .from('owner_settings')
    .select('*')
    .eq('email', email)
    .single();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from('owner_settings')
    .insert({ email })
    .select()
    .single();

  if (error) throw error;
  return created;
}
