import { NextRequest, NextResponse } from 'next/server';
import { getOwnerFromRequest, logAudit } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

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

    // Generate headline
    const headline = `${currentRole} at ${company} | ${expertise1} ${expertise2 ? '& ' + expertise2 : ''} | ${industry}`.slice(0, 220);

    // Generate About section
    const about = `${fullName} is the ${currentRole} of ${company}, bringing ${yearsExperience} of experience in ${industry}.

Known for ${expertise1}, ${expertise2}${expertise3 ? ', and ' + expertise3 : ''}, ${fullName.split(' ')[0]} has ${achievements}

${fullName.split(' ')[0]} helps ${targetAudience} by ${mainGoal}.

Content themes: ${contentThemes}

Connect to discuss ${expertise1.toLowerCase()}, ${expertise2.toLowerCase()}, and how we can work together.`;

    // Generate Experience section
    const experience = `${currentRole} at ${company}
${industry}
${yearsExperience} of building and scaling ${expertise1.toLowerCase()} and ${expertise2.toLowerCase()} initiatives.

Key achievements:
${achievements}

Focused on helping ${targetAudience} achieve their goals through ${expertise1.toLowerCase()} and strategic execution.`;

    // Generate Featured section
    const featured = `Connect with me to discuss:
• ${expertise1}
• ${expertise2}
${expertise3 ? `• ${expertise3}` : ''}
• ${mainGoal}

I write about: ${contentThemes}`;

    // Save to database
    const fields = [
      { field: 'headline', content: headline },
      { field: 'about', content: about },
      { field: 'experience', content: experience },
      { field: 'featured', content: featured },
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

    await logAudit(owner.id, 'create', 'profile_copy', owner.id, { source: 'onboarding' });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error generating profile:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate profile' }, { status: 500 });
  }
}
