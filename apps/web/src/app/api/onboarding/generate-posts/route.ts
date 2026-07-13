import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

const POST_TEMPLATES = [
  {
    template: (theme: string, expertise: string) =>
      `The biggest mistake I see in ${theme.toLowerCase()}:\n\n[Specific mistake]\n\nWhat works instead:\n\n[Solution]\n\nI learned this after ${expertise.toLowerCase()} for 10+ years. Save yourself the pain.`,
    archetype: 'mistake_lesson',
  },
  {
    template: (theme: string, expertise: string) =>
      `Three things I wish I knew about ${theme.toLowerCase()} before starting:\n\n1. [Insight 1]\n\n2. [Insight 2]\n\n3. [Insight 3]\n\nThese would have saved months of work.`,
    archetype: 'lessons_learned',
  },
  {
    template: (theme: string, expertise: string) =>
      `Everyone talks about ${theme.toLowerCase()}.\n\nAlmost no one does it right.\n\nHere's what actually works:\n\n[Specific tactic or framework]\n\nThis is how we scaled from [A] to [B].`,
    archetype: 'contrarian_insight',
  },
  {
    template: (theme: string, expertise: string) =>
      `If you're working on ${theme.toLowerCase()}, here's the framework I use:\n\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n4. [Step 4]\n\nThis simplified our process and saved 20+ hours per week.`,
    archetype: 'framework',
  },
  {
    template: (theme: string, expertise: string) =>
      `Real talk about ${theme.toLowerCase()}:\n\nIt's harder than people say. But it's also simpler.\n\nHere's what matters:\n\n[Core principle]\n\nEverything else is noise.`,
    archetype: 'real_talk',
  },
  {
    template: (theme: string, expertise: string) =>
      `Quick wins for ${theme.toLowerCase()}:\n\n• [Tactic 1]\n• [Tactic 2]\n• [Tactic 3]\n\nThese take less than a week to implement and produce immediate results.`,
    archetype: 'quick_wins',
  },
];

export async function POST(request: NextRequest) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const {
      currentRole,
      company,
      expertise1,
      expertise2,
      contentThemes,
    } = data;

    // Get content pillars
    const themes = contentThemes.split(',').map((p: string) => p.trim()).filter(Boolean);
    
    // Get pillars from database
    const { data: pillarsData } = await supabase
      .from('content_pillars')
      .select('*')
      .eq('owner_id', owner.id)
      .order('sort_order');

    const pillars = pillarsData || [];

    // Generate 14 posts (2 weeks at ~1 post per day average)
    const postsToCreate = [];
    for (let i = 0; i < 14; i++) {
      const theme = themes[i % themes.length] || expertise1;
      const template = POST_TEMPLATES[i % POST_TEMPLATES.length];
      const pillar = pillars[i % pillars.length];
      
      // Create post body from template
      const body = template.template(theme, expertise1);
      
      postsToCreate.push({
        owner_id: owner.id,
        body,
        body_hash: crypto.createHash('sha256').update(body).digest('hex'),
        status: 'draft',
        pillar: pillar?.name || theme,
        archetype: template.archetype,
        notes: `Auto-generated from onboarding. Edit before publishing.`,
      });
    }

    // Insert posts
    const { error: insertError } = await supabase
      .from('posts')
      .insert(postsToCreate);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await logAudit(owner.id, 'create', 'posts', owner.id, { 
      source: 'onboarding',
      count: postsToCreate.length 
    });

    return NextResponse.json({ success: true, count: postsToCreate.length });
  } catch (err: any) {
    console.error('Error generating posts:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate posts' }, { status: 500 });
  }
}
