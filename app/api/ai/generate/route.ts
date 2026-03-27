// SendGem - AI Email Generation API
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateEmailSequence, generateSingleEmail, generateSubjectLineOptions, improveEmail } from '@/lib/ai-email';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'generate-sequence': {
        const prospect = {
          firstName: params.firstName,
          lastName: params.lastName,
          company: params.company,
          title: params.title,
          linkedinUrl: params.linkedinUrl,
          website: params.website,
          customFields: params.customFields,
        };

        const sequence = await generateEmailSequence(
          prospect,
          params.userVoice,
          params.customPrompt
        );

        return NextResponse.json({ sequence });
      }

      case 'generate-single': {
        const prospect = {
          firstName: params.firstName,
          lastName: params.lastName,
          company: params.company,
          title: params.title,
          linkedinUrl: params.linkedinUrl,
          website: params.website,
          customFields: params.customFields,
        };

        const email = await generateSingleEmail(
          prospect,
          params.context,
          params.userVoice
        );

        return NextResponse.json({ email });
      }

      case 'improve': {
        const prospect = {
          firstName: params.firstName,
          lastName: params.lastName,
          company: params.company,
          title: params.title,
        };

        const improved = await improveEmail(
          params.currentEmail,
          prospect,
          params.improvementType
        );

        return NextResponse.json({ email: improved });
      }

      case 'subject-lines': {
        const prospect = {
          firstName: params.firstName,
          lastName: params.lastName,
          company: params.company,
        };

        const subjects = await generateSubjectLineOptions(prospect, params.numOptions || 5);

        return NextResponse.json({ subjects });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}