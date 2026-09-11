/**
 * Contact Form Handler
 * 
 * Server-side validation + Resend email delivery
 * Free tier: 100 emails/day
 */

import { Resend } from 'resend';
import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honeypot: z.string().max(0, 'Bot detected').optional().default(''),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export interface ContactFormConfig {
  resendApiKey: string;
  toEmail: string;
  fromEmail?: string;
  subjectPrefix?: string;
}

/**
 * Validate and send contact form email
 */
export async function handleContactForm(
  data: ContactFormData,
  config: ContactFormConfig
): Promise<{ success: boolean; error?: string }> {
  // Honeypot check
  if (data.honeypot && data.honeypot.length > 0) {
    return { success: true }; // Silently reject bots
  }

  // Validate
  const result = contactFormSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  const { name, email, subject, message } = result.data;

  try {
    const resend = new Resend(config.resendApiKey);
    
    await resend.emails.send({
      from: config.fromEmail || 'contact@yourdomain.com',
      to: config.toEmail,
      replyTo: email,
      subject: `${config.subjectPrefix || '[Contact]'} ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `.trim(),
    });

    return { success: true };
  } catch (error) {
    console.error('Contact form error:', error);
    return { success: false, error: 'Failed to send message. Please try again.' };
  }
}

/**
 * Generate contact form HTML (Astro component compatible)
 */
export function getContactFormHTML(config?: { action?: string; method?: string }) {
  const action = config?.action || '/api/contact';
  const method = config?.method || 'POST';
  
  return `
<form action="${action}" method="${method}" class="contact-form" id="contact-form">
  <div class="form-group">
    <label for="name" class="form-label">Name</label>
    <input type="text" id="name" name="name" required minlength="2" class="form-input" />
  </div>
  
  <div class="form-group">
    <label for="email" class="form-label">Email</label>
    <input type="email" id="email" name="email" required class="form-input" />
  </div>
  
  <div class="form-group">
    <label for="subject" class="form-label">Subject</label>
    <input type="text" id="subject" name="subject" required minlength="3" class="form-input" />
  </div>
  
  <div class="form-group">
    <label for="message" class="form-label">Message</label>
    <textarea id="message" name="message" required minlength="10" rows="5" class="form-input"></textarea>
  </div>
  
  <!-- Honeypot - hidden from humans -->
  <div style="position:absolute;left:-9999px;" aria-hidden="true">
    <input type="text" name="honeypot" tabindex="-1" autocomplete="off" />
  </div>
  
  <button type="submit" class="btn-primary">Send Message</button>
</form>
  `.trim();
}
