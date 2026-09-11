/**
 * Email Templates Index
 * 
 * All email templates for the application.
 * Use with Resend or any email service.
 */

export { default as WelcomeEmail } from './WelcomeEmail.astro';
export { default as PasswordResetEmail } from './PasswordResetEmail.astro';
export { default as InvoiceEmail } from './InvoiceEmail.astro';
export { default as NotificationEmail } from './NotificationEmail.astro';
export { default as TrialEndingEmail } from './TrialEndingEmail.astro';

/**
 * Email configuration interface
 */
export interface EmailConfig {
  resendApiKey: string;
  fromEmail: string;
  replyTo?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(
  config: EmailConfig,
  options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(config.resendApiKey);
    
    await resend.emails.send({
      from: config.fromEmail,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || config.replyTo,
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Email templates with their subjects
 */
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to {productName}',
    description: 'Sent when a new user signs up',
  },
  passwordReset: {
    subject: 'Reset your password',
    description: 'Sent when user requests password reset',
  },
  invoice: {
    subject: 'Your invoice #{invoiceId}',
    description: 'Sent after successful payment',
  },
  notification: {
    subject: '{title}',
    description: 'General notification email',
  },
  trialEnding: {
    subject: 'Your trial ends in {daysLeft} days',
    description: 'Sent 3 days and 1 day before trial ends',
  },
} as const;

/**
 * Environment variables needed:
 * 
 * RESEND_API_KEY=re_xxxxx
 * EMAIL_FROM=noreply@yourdomain.com
 * EMAIL_REPLY_TO=support@yourdomain.com
 */
