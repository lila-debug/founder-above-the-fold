import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

// Banned words and patterns for British English voice gate
const BANNED_WORDS = [
  'gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'hafta', 'shoulda', 'woulda', 'coulda',
  'musta', 'dunno', 'lemme', 'gimme', 'betcha', 'whatcha', 'gotcha', 'buncha', 'lotta',
  'outta', 'lotsa', 'tryna', 'finna', 'y\'all', 'ain\'t', 'oughta', 'thru', 'nite', 'lite',
  'tho', 'cuz', 'cos', 'alright', 'awesome', 'sure thing', 'absolutely', 'you bet',
  'no worries', 'my bad', 'for sure', 'totally', 'you\'re all set', 'sounds good',
  'frustrated', 'frustrating', 'frustration'
];

const AMERICANISMS = [
  'color', 'center', 'realize', 'organize', 'traveling', 'defense', 'license',
  'check', 'program', 'tire', 'store', 'apartment', 'elevator', 'truck', 'gas',
  'cell phone', 'movie', 'vacation', 'faucet', 'diaper', 'candy', 'cookie',
  'pants', 'sweater', 'sneakers', 'highway', 'subway', 'mall', 'drugstore'
];

function runVoiceCheck(body: string): { status: 'passed' | 'failed'; failures: string[] } {
  const failures: string[] = [];
  const lowerBody = body.toLowerCase();

  // Check banned words
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lowerBody)) {
      failures.push(`Banned word detected: "${word}"`);
    }
  }

  // Check Americanisms (warn only, not fail)
  for (const word of AMERICANISMS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lowerBody)) {
      failures.push(`Americanism detected: "${word}" — consider British English alternative`);
    }
  }

  // Check for emojis in text
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  if (emojiRegex.test(body)) {
    failures.push('Emojis detected — remove for professional tone');
  }

  // Check sentence length (flag very long sentences)
  const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 40);
  if (longSentences.length > 0) {
    failures.push(`${longSentences.length} sentence(s) exceed 40 words — consider breaking them up`);
  }

  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    failures,
  };
}

// POST /api/posts/:id/voice-check
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get the post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', owner.id)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Run voice check
  const result = runVoiceCheck(post.body);

  // Store the result
  const { data: voiceCheck, error: vcError } = await supabase
    .from('voice_checks')
    .insert({
      post_id: params.id,
      body_hash: post.body_hash,
      status: result.status,
      failures: result.failures.length > 0 ? JSON.stringify(result.failures) : null,
    })
    .select()
    .single();

  if (vcError) {
    return NextResponse.json({ error: vcError.message }, { status: 500 });
  }

  await logAudit(owner.id, 'voice_check', 'post', params.id, {
    status: result.status,
    failures: result.failures,
  });

  return NextResponse.json({
    voiceCheck: {
      ...voiceCheck,
      failures: result.failures,
    },
  });
}
