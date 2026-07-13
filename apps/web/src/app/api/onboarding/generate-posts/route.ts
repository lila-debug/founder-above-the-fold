import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const POST_ARCHETYPES = [
  'mistake_lesson',
  'lessons_learned',
  'contrarian_insight',
  'framework',
  'real_talk',
  'quick_wins',
  'origin_story',
  'unpopular_opinion',
];

export async function POST(request: NextRequest) {
  const owner = await getOwnerFromRequest(request);
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const {
      fullName,
      currentRole,
      company,
      industry,
      yearsExperience,
      targetAudience,
      mainGoal,
      expertise1,
      expertise2,
      expertise3,
      achievements,
      contentThemes,
      voiceTone,
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

    // Generate 14 posts using AI
    const postsToCreate = [];
    
    for (let i = 0; i < 14; i++) {
      const theme = themes[i % themes.length] || expertise1;
      const archetype = POST_ARCHETYPES[i % POST_ARCHETYPES.length];
      const pillar = pillars[i % pillars.length];

      const prompt = `You are writing a LinkedIn post for ${fullName}, a ${currentRole} at ${company} in ${industry}.

Voice: ${voiceTone}
Target audience: ${targetAudience}
Expertise: ${expertise1}, ${expertise2}${expertise3 ? ', ' + expertise3 : ''}
Notable achievements: ${achievements}

Write a ${archetype} post about: ${theme}

Rules:
- British English only (colour, realise, organisation)
- No emojis
- No banned words: gonna, wanna, gotta, kinda, sorta
- Keep sentences under 40 words
- Make it actionable and credible
- 150-250 words
- Use first person
- Professional but direct

Output ONLY the post text. No title, no hashtags, no meta-commentary.`;

      try {
        const { text } = await generateText({
          model: openai('gpt-4o-mini'),
          prompt,
          temperature: 0.8,
        });

        postsToCreate.push({
          owner_id: owner.id,
          body: text.trim(),
          body_hash: crypto.createHash('sha256').update(text.trim()).digest('hex'),
          status: 'draft',
          pillar: pillar?.name || theme,
          archetype,
          notes: `AI-generated from onboarding. Review before publishing.`,
        });
      } catch (aiError) {
        console.error('AI generation failed for post', i, aiError);
        // Fallback to simple template if AI fails
        postsToCreate.push({
          owner_id: owner.id,
          body: `Write about ${theme} here. Share a specific insight from your ${yearsExperience} of experience in ${expertise1}.`,
          body_hash: crypto.createHash('sha256').update(`fallback-${i}`).digest('hex'),
          status: 'draft',
          pillar: pillar?.name || theme,
          archetype,
          notes: `Template fallback. Edit and personalize.`,
        });
      }
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
      count: postsToCreate.length,
      ai_powered: true,
    });

    return NextResponse.json({ success: true, count: postsToCreate.length });
  } catch (err: any) {
    console.error('Error generating posts:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate posts' }, { status: 500 });
  }
}
