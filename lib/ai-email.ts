// SendGem - AI Email Generation using OpenRouter
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface EmailSequence {
  subjectLine: string;
  emailBody: string;
}

export interface ProspectData {
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  linkedinUrl?: string;
  website?: string;
  customFields?: Record<string, string>;
}

const SYSTEM_PROMPT = `You are an expert cold email copywriter specializing in B2B sales outreach. 
Your job is to write highly personalized, effective cold emails that get responses.

Guidelines:
- Keep emails short (50-150 words)
- Use a conversational, friendly tone
- Personalize based on the prospect's company, role, or background
- Include a clear but low-pressure call to action
- Never use buzzwords or corporate speak
- Focus on the prospect's pain points
- Make it sound like a real person wrote it`;

async function generateWithOpenRouter(prompt: string, model: string = 'anthropic/claude-3-haiku') {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'SendGem',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateEmailSequence(
  prospect: ProspectData,
  userVoice?: string,
  customPrompt?: string
): Promise<EmailSequence[]> {
  const personalization = buildPersonalization(prospect);

  const basePrompt = `Write a 3-step email sequence for outreach to:

Prospect: ${prospect.firstName || ''} ${prospect.lastName || ''}
Company: ${prospect.company || 'N/A'}
Title: ${prospect.title || 'N/A'}
LinkedIn: ${prospect.linkedinUrl || 'N/A'}
Website: ${prospect.website || 'N/A'}

${customPrompt ? `Additional context: ${customPrompt}` : ''}
${userVoice ? `Writing style to match: ${userVoice}` : ''}

For each email:
1. Subject line
2. Email body (keep it short and personalized)

Return ONLY valid JSON in this exact format:
[
  {"step": 1, "subject": "subject line here", "body": "email body here"},
  {"step": 2, "subject": "subject line here", "body": "email body here"},
  {"step": 3, "subject": "subject line here", "body": "email body here"}
]`;

  try {
    const result = await generateWithOpenRouter(basePrompt);
    const parsed = JSON.parse(result);
    
    return parsed.map((email: any) => ({
      subjectLine: email.subject,
      emailBody: email.body,
    }));
  } catch (error) {
    console.error('Failed to generate email sequence:', error);
    throw error;
  }
}

export async function generateSingleEmail(
  prospect: ProspectData,
  context: string,
  userVoice?: string
): Promise<EmailSequence> {
  const prompt = `Write a cold outreach email for:

Prospect: ${prospect.firstName || ''} ${prospect.lastName || ''}
Company: ${prospect.company || 'N/A'}
Title: ${prospect.title || 'N/A'}
Context/Purpose: ${context}
${userVoice ? `Writing style: ${userVoice}` : ''}

Requirements:
- Short (50-100 words)
- Personalized
- Clear CTA
- Professional but friendly

Return ONLY valid JSON:
{"subject": "subject line", "body": "email body"}`;

  try {
    const result = await generateWithOpenRouter(prompt);
    const parsed = JSON.parse(result);
    
    return {
      subjectLine: parsed.subject,
      emailBody: parsed.body,
    };
  } catch (error) {
    console.error('Failed to generate email:', error);
    throw error;
  }
}

export async function improveEmail(
  currentEmail: string,
  prospect: ProspectData,
  improvementType: 'shorter' | 'more_personal' | 'clearer_cta' | 'better_subject'
): Promise<EmailSequence> {
  const prompts: Record<string, string> = {
    shorter: 'Make this email shorter and more concise while keeping the key message.',
    more_personal: 'Add more personalization based on the prospect info provided.',
    clearer_cta: 'Make the call to action clearer and more compelling.',
    better_subject: 'Write a better, more attention-grabbing subject line.',
  };

  const prompt = `Current email:
${currentEmail}

Prospect: ${prospect.firstName || ''} ${prospect.lastName || ''} at ${prospect.company || 'N/A'}

${prompts[improvementType]}

Return ONLY valid JSON:
{"subject": "improved subject line", "body": "improved email body"}`;

  try {
    const result = await generateWithOpenRouter(prompt);
    const parsed = JSON.parse(result);
    
    return {
      subjectLine: parsed.subject,
      emailBody: parsed.body,
    };
  } catch (error) {
    console.error('Failed to improve email:', error);
    throw error;
  }
}

export async function generateSubjectLineOptions(
  prospect: ProspectData,
  numOptions: number = 5
): Promise<string[]> {
  const prompt = `Generate ${numOptions} subject line options for a cold outreach email to:

${prospect.firstName || ''} ${prospect.lastName || ''} at ${prospect.company || 'N/A'}

Requirements:
- Short (under 50 characters)
- Personalized
- Intriguing but not spammy
- No all-caps or excessive punctuation

Return ONLY valid JSON:
{"subjects": ["subject 1", "subject 2", "subject 3", "subject 4", "subject 5"]}`;

  try {
    const result = await generateWithOpenRouter(prompt);
    const parsed = JSON.parse(result);
    return parsed.subjects;
  } catch (error) {
    console.error('Failed to generate subject lines:', error);
    throw error;
  }
}

function buildPersonalization(prospect: ProspectData): string {
  const parts: string[] = [];
  
  if (prospect.firstName) parts.push(`First name: ${prospect.firstName}`);
  if (prospect.lastName) parts.push(`Last name: ${prospect.lastName}`);
  if (prospect.company) parts.push(`Company: ${prospect.company}`);
  if (prospect.title) parts.push(`Title: ${prospect.title}`);
  if (prospect.linkedinUrl) parts.push(`LinkedIn: ${prospect.linkedinUrl}`);
  if (prospect.website) parts.push(`Website: ${prospect.website}`);
  if (prospect.customFields) {
    Object.entries(prospect.customFields).forEach(([key, value]) => {
      parts.push(`${key}: ${value}`);
    });
  }
  
  return parts.join('\n');
}