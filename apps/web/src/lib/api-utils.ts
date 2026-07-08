import { NextRequest } from 'next/server';
import { verifySession } from './auth';
import { supabase } from './supabase';

export async function getOwnerFromRequest(request: NextRequest) {
  const token = request.cookies.get('fatf_session')?.value;
  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  const { data: owner } = await supabase
    .from('owner_settings')
    .select('*')
    .eq('email', session.email)
    .single();

  return owner || null;
}

export function generateBodyHash(body: string): string {
  // Simple hash for voice check invalidation
  let hash = 0;
  for (let i = 0; i < body.length; i++) {
    const char = body.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export async function logAudit(ownerId: string, action: string, entityType: string, entityId?: string, details?: any) {
  await supabase.from('audit_log').insert({
    owner_id: ownerId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: details ? JSON.stringify(details) : null,
  });
}
