import { Resend } from 'resend';
import * as React from 'react';

import WelcomeEmail from '@/emails/WelcomeEmail';
import SubscriptionConfirmedEmail from '@/emails/SubscriptionConfirmedEmail';
import DrawResultsEmail from '@/emails/DrawResultsEmail';
import WinnerEmail from '@/emails/WinnerEmail';
import PayoutConfirmedEmail from '@/emails/PayoutConfirmedEmail';
import PasswordResetEmail from '@/emails/PasswordResetEmail';

// In local dev, if no key is provided, we'll just mock the sending
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = "Golf Draw <no-reply@golfdraw.com>";

export type EmailTemplate = 
  | 'welcome' 
  | 'subscription_confirmed' 
  | 'draw_results' 
  | 'winner' 
  | 'payout_confirmed' 
  | 'password_reset';

export async function sendEmail({ to, template, data }: { to: string, template: EmailTemplate, data: any }) {
  if (!resend) {
    console.log(`[Email Mock] Would send ${template} to ${to} with data:`, data);
    return { success: true, mock: true };
  }

  try {
    let subject = '';
    let reactComponent: React.ReactElement | null = null;

    switch (template) {
      case 'welcome':
        subject = "Welcome to Golf Draw 🏌️";
        reactComponent = WelcomeEmail(data);
        break;
      case 'subscription_confirmed':
        subject = "Subscription Confirmed ✅";
        reactComponent = SubscriptionConfirmedEmail(data);
        break;
      case 'draw_results':
        subject = `🎯 Draw Results — ${data.month}`;
        reactComponent = DrawResultsEmail(data);
        break;
      case 'winner':
        subject = `🏆 You Won £${data.amount}!`;
        reactComponent = WinnerEmail(data);
        break;
      case 'payout_confirmed':
        subject = `💰 Payment Sent — £${data.amount}`;
        reactComponent = PayoutConfirmedEmail(data);
        break;
      case 'password_reset':
        subject = "Reset Your Golf Draw Password";
        reactComponent = PasswordResetEmail(data);
        break;
      default:
        throw new Error(`Unknown template: ${template}`);
    }

    const { data: result, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      react: reactComponent,
    });

    if (error) {
      console.error("[Resend Error]", error);
      return { success: false, error };
    }

    return { success: true, result };
  } catch (err) {
    console.error("[Email Exception]", err);
    return { success: false, error: err };
  }
}
