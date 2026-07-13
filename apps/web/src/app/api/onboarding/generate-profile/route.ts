import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

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

    // Generate headline (120 chars)
    const { text: headline } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Write a LinkedIn headline for ${fullName}, ${currentRole} at ${company}.
      
Expertise: ${expertise1}, ${expertise2}${expertise3 ? ', ' + expertise3 : ''}
Industry: ${industry}
Years experience: ${yearsExperience}

Rules:
- Maximum 120 characters
- Include role, company, top 2 expertise areas
- Professional and credible
- British English
- No emojis

Output ONLY the headline text.`,
      temperature: 0.7,
    });

    // Generate About section (2000 chars)
    const { text: about } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Write a LinkedIn About section for ${fullName}, ${currentRole} at ${company}.

Role: ${currentRole}
Company: ${company}
Industry: ${industry}
Years experience: ${yearsExperience}
Expertise: ${expertise1}, ${expertise2}${expertise3 ? ', ' + expertise3 : ''}
Achievements: ${achievements}
Target audience: ${targetAudience}
Main goal: ${mainGoal}
Content themes: ${contentThemes}

Rules:
- 300-500 words
- First person
- Professional but approachable
- British English (colour, realise, organisation)
- No emojis
- Include expertise, achievements, who you help
- End with call to action (connect/discuss)
- Use short paragraphs
- ${voiceTone} tone

Output ONLY the About text.`,
      temperature: 0.8,
    });

    // Generate Experience description
    const { text: experience } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Write a LinkedIn Experience description for ${fullName}'s role as ${currentRole} at ${company}.

Industry: ${industry}
Years experience: ${yearsExperience}
Expertise: ${expertise1}, ${expertise2}${expertise3 ? ', ' + expertise3 : ''}
Key achievements: ${achievements}
Target audience: ${targetAudience}

Rules:
- 150-250 words
- Bullet points for key achievements
- Focus on impact and results
- British English
- No emojis
- Professional tone
- Include specific metrics where possible

Output ONLY the experience description.`,
      temperature: 0.7,
    });

    // Generate Featured section
    const { text: featured } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Write a LinkedIn Featured section prompt for ${fullName}, ${currentRole} at ${company}.

Expertise: ${expertise1}, ${expertise2}${expertise3 ? ', ' + expertise3 : ''}
Content themes: ${contentThemes}
Main goal: ${mainGoal}

Rules:
- 100-150 words
- Invite people to connect/discuss specific topics
- List 3-4 discussion areas
- Professional and inviting
- British English
- No emojis

Output ONLY the featured section text.`,
      temperature: 0.7,
    });

    // Save to database
    const fields = [
      { field: 'headline', content: headline.trim() },
      { field: 'about', content: about.trim() },
      { field: 'experience', content: experience.trim() },
      { field: 'featured', content: featured.trim() },
    ];

    for (const { field, content } of fields) {
      // Check if exists
      const { data: existing } = await supabase
        .from('profile_copy')
        .select('*')
        .eq('owner_id', owner.id)
        .eq('field', field)
        .single();

      if (existing) {
        await supabase
          .from('profile_copy')
          .update({
            content,
            version: existing.version + 1,
            synced: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('profile_copy')
          .insert({
            owner_id: owner.id,
            field,
            content,
            version: 1,
            synced: false,
          });
      }
    }

    // Save content pillars
    const pillars = contentThemes.split(',').map((p: string) => p.trim()).filter(Boolean);
    for (let i = 0; i < pillars.length && i < 5; i++) {
      await supabase
        .from('content_pillars')
        .insert({
          owner_id: owner.id,
          name: pillars[i],
          description: `Posts about ${pillars[i].toLowerCase()}`,
          sort_order: i,
        });
    }

    await logAudit(owner.id, 'create', 'profile_copy', owner.id, { 
      source: 'onboarding',
      ai_powered: true,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error generating profile:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate profile' }, { status: 500 });
  }
}
