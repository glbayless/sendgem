// SendGem - Email Sending with Resend + Custom SMTP
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  from?: string;
  replyTo?: string;
  html?: string;
  text?: string;
  campaignId?: string;
  prospectId?: string;
}

export interface EmailAccount {
  id: string;
  email: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPassword?: string;
}

// Send via Resend (primary method)
export async function sendViaResend(params: SendEmailParams) {
  const { to, subject, body, from, replyTo, html, text } = params;

  const defaultFrom = process.env.DEFAULT_FROM_EMAIL || 'noreply@sendgem.ai';

  try {
    const data = await resend.emails.send({
      from: from || defaultFrom,
      reply_to: replyTo || defaultFrom,
      to,
      subject,
      text: text || body,
      html: html || `<p>${body}</p>`,
    });

    // Handle different response formats
    let messageId: string | undefined;
    if (data && typeof data === 'object') {
      messageId = (data as any).data?.id || (data as any).id;
    }

    return {
      success: true,
      messageId,
      provider: 'resend',
    };
  } catch (error: any) {
    console.error('Resend send error:', error);
    return {
      success: false,
      error: error.message,
      provider: 'resend',
    };
  }
}

// Send via custom SMTP
export async function sendViaSMTP(params: SendEmailParams & { smtpConfig: EmailAccount }) {
  // For custom SMTP, we'd use nodemailer
  // This is a placeholder - implement with actual SMTP configuration
  const { smtpConfig, to, subject, body } = params;

  console.log(`Sending via SMTP to ${to} from ${smtpConfig.email}`);
  
  // TODO: Implement actual SMTP sending using nodemailer
  // Example:
  // const transporter = nodemailer.createTransport({
  //   host: smtpConfig.smtpHost,
  //   port: parseInt(smtpConfig.smtpPort || '587'),
  //   secure: smtpConfig.smtpPort === '465',
  //   auth: {
  //     user: smtpConfig.smtpUser,
  //     pass: smtpConfig.smtpPassword,
  //   },
  // });

  return {
    success: true,
    messageId: `smtp_${Date.now()}`,
    provider: 'smtp',
  };
}

// Smart email sending - chooses best method
export async function sendEmail(params: SendEmailParams & { useSMTP?: boolean; smtpConfig?: EmailAccount }) {
  if (params.useSMTP && params.smtpConfig) {
    return sendViaSMTP({ ...params, smtpConfig: params.smtpConfig } as SendEmailParams & { smtpConfig: EmailAccount });
  }
  
  return sendViaResend(params);
}

// Batch send with rate limiting
export async function sendBatchEmails(
  emails: SendEmailParams[],
  rateLimitPerMinute: number = 50
) {
  const results = [];
  const delayMs = Math.ceil(60000 / rateLimitPerMinute);

  for (const email of emails) {
    const result = await sendEmail(email);
    results.push(result);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return results;
}

// Verify email deliverability (placeholder - Resend doesn't have this in current version)
export async function verifyEmail(email: string) {
  // Email verification would go here - using a service like AbstractAPI or Hunter
  return { valid: true, score: 100 };
}

// Track email opens (for analytics)
export function generateTrackingPixel(campaignId: string, prospectId: string, logId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/tracking/open?campaignId=${campaignId}&prospectId=${prospectId}&logId=${logId}`;
}

// Generate unique reply-to address for tracking
export function generateReplyToAddress(campaignId: string, prospectId: string) {
  return `reply+${campaignId}-${prospectId}@sendgem.ai`;
}