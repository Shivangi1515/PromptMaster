import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
let resend;

if (apiKey) {
  resend = new Resend(apiKey);
}

export async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn('Resend not configured — email not sent');
    return;
  }

  try {
    await resend.emails.send({
      from: 'PromptMaster <noreply@promptmaster.dev>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
}
