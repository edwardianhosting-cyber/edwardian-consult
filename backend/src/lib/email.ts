import prisma from './prisma';

// ─── Config ──────────────────────────────────────────────────────────────────
// All emails are sent via the PHP mailer hosted on Whogohost.
// The PHP script handles SMTP internally — no SMTP ports needed from Render.

const PHP_MAILER_URL = process.env.PHP_MAILER_URL;
const PHP_MAILER_KEY = process.env.PHP_MAILER_KEY;
const FRONTEND_URL   = process.env.FRONTEND_URL;
const FROM_EMAIL     = process.env.FROM_EMAIL;

if (!PHP_MAILER_URL || !PHP_MAILER_KEY || !FROM_EMAIL) {
  throw new Error('PHP_MAILER_URL, PHP_MAILER_KEY, and FROM_EMAIL are required');
}

export type EmailPurpose = 'REGISTRAR' | 'SECURITY' | 'NOTIFICATION';

export interface EmailRecipient {
  email: string;
  name?: string;
}

// ─── Core send function ───────────────────────────────────────────────────────

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  name?: string;
  purpose?: EmailPurpose;
}): Promise<boolean> {
  const { to, subject, html, purpose = 'NOTIFICATION' } = params;

  if (!PHP_MAILER_URL) {
    console.warn('[email] PHP_MAILER_URL not set — skipping email send');
    return false;
  }

  try {
    const response = await fetch(PHP_MAILER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PHP_MAILER_KEY}`,
      },
      body: JSON.stringify({ to, subject, html }),
    });

    const data = await response.json() as { success: boolean; message?: string };

    if (!data.success) {
      throw new Error(data.message || 'PHP mailer returned failure');
    }

    console.log(`[email] Sent "${subject}" to ${to}`);
    await logEmail(to, subject, purpose, 'SENT');
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[email] Failed to send to ${to}:`, msg);
    await logEmail(to, subject, purpose, 'FAILED', msg);
    return false;
  }
}

// ─── Email log ────────────────────────────────────────────────────────────────

async function logEmail(
  recipient: string,
  subject: string,
  emailType: string,
  status: 'SENT' | 'FAILED',
  errorMsg?: string
) {
  try {
    await prisma.emailLog.create({
      data: {
        recipient,
        sender: FROM_EMAIL,
        subject,
        emailType,
        status,
        errorMsg,
      },
    });
  } catch (e) {
    console.error('[email] Failed to log email:', e);
  }
}

// ─── Welcome email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  email: string,
  name: string,
  portalId: string,
  password: string,
  parentCode: string,
  studentEmail?: string
): Promise<boolean> {
  const subject = 'Welcome to Edwardian Educational Consult - Your Account Details';

  const studentEmailRow = studentEmail
    ? `<tr>
         <td style="padding:8px 0;color:#666;"><strong>Official Student Email:</strong></td>
         <td style="padding:8px 0;color:#6B003B;font-weight:bold;">${studentEmail}</td>
       </tr>`
    : '';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#6B003B;padding:30px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">Edwardian Educational Consult</h1>
        <p style="color:#FFD700;margin:10px 0 0 0;">Your Pathway to Academic Excellence</p>
      </div>
      <div style="padding:30px;background:#ffffff;">
        <h2 style="color:#333;">Welcome, ${name}!</h2>
        <p>Thank you for registering with Edwardian Educational Consult. Your account has been successfully created.</p>
        <div style="background:#f8f9fa;padding:25px;border-radius:10px;margin:25px 0;border-left:4px solid #6B003B;">
          <h3 style="color:#6B003B;margin-top:0;">Your Login Details</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#666;"><strong>Portal ID:</strong></td>
              <td style="padding:8px 0;color:#333;">${portalId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666;"><strong>Email:</strong></td>
              <td style="padding:8px 0;color:#333;">${email}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666;"><strong>Password:</strong></td>
              <td style="padding:8px 0;font-family:monospace;background:#eee;padding:5px 10px;border-radius:4px;">${password}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666;"><strong>Parent Access Code:</strong></td>
              <td style="padding:8px 0;color:#333;">${parentCode}</td>
            </tr>
            ${studentEmailRow}
          </table>
        </div>
        <div style="background:#fff3cd;padding:15px;border-radius:8px;margin:20px 0;border:1px solid #ffc107;">
          <p style="margin:0 0 8px 0;color:#856404;"><strong>Important:</strong> Please save your password securely. You can change it after logging in.</p>
          <p style="margin:0;color:#856404;">If you did not receive this email in your inbox, please check your <strong>Spam</strong> or <strong>Junk</strong> folder and mark it as "Not Spam" to receive future emails.</p>
        </div>
        <div style="text-align:center;margin:30px 0;">
          <a href="${FRONTEND_URL}/login"
             style="display:inline-block;background:#FFD700;color:#6B003B;padding:15px 40px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
            LOGIN TO YOUR PORTAL
          </a>
        </div>
        <p style="color:#666;font-size:14px;">Questions? Contact us at registrar@edwardianeducationalconsult.com.ng</p>
      </div>
      <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#999;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} Edwardian Educational Consult. All rights reserved.</p>
      </div>
    </div>
  `;

  const success = await sendEmail({ to: email, name, subject, html, purpose: 'REGISTRAR' });
  await logEmail(email, subject, 'WELCOME', success ? 'SENT' : 'FAILED');
  return success;
}

// ─── 2FA code email ───────────────────────────────────────────────────────────

export async function sendTwoFACodeEmail(
  email: string,
  name: string,
  code: string,
  purpose: 'LOGIN' | 'PASSWORD_CHANGE' | 'EMAIL_CHANGE' = 'LOGIN'
): Promise<boolean> {
  const subject = 'Your Edwardian Security Code';
  const actionText =
    purpose === 'LOGIN' ? 'login to your account' :
    purpose === 'PASSWORD_CHANGE' ? 'change your password' :
    'change your email';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#6B003B;padding:30px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">Edwardian Educational Consult</h1>
        <p style="color:#FFD700;margin:10px 0 0 0;">Security Verification</p>
      </div>
      <div style="padding:30px;background:#ffffff;">
        <h2 style="color:#333;">Hello ${name},</h2>
        <p>Your security verification code to ${actionText} is:</p>
        <div style="background:#f8f9fa;padding:30px;border-radius:10px;margin:25px 0;text-align:center;border:2px dashed #6B003B;">
          <p style="font-size:48px;font-weight:bold;letter-spacing:10px;color:#6B003B;margin:0;">${code}</p>
        </div>
        <div style="background:#fff3cd;padding:15px;border-radius:8px;margin:20px 0;border:1px solid #ffc107;">
          <p style="margin:0;color:#856404;"><strong>Important:</strong> This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
        <p style="color:#666;font-size:14px;">If you did not request this code, please ignore this email and secure your account immediately.</p>
      </div>
      <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#999;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} Edwardian Educational Consult. All rights reserved.</p>
      </div>
    </div>
  `;

  const success = await sendEmail({ to: email, name, subject, html, purpose: 'SECURITY' });
  await logEmail(email, subject, '2FA_CODE', success ? 'SENT' : 'FAILED');
  return success;
}

// ─── Password reset email ─────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<boolean> {
  const subject = 'Password Reset Request';
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#6B003B;padding:30px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">Edwardian Educational Consult</h1>
        <p style="color:#FFD700;margin:10px 0 0 0;">Password Reset</p>
      </div>
      <div style="padding:30px;background:#ffffff;">
        <h2 style="color:#333;">Hello ${name},</h2>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}"
             style="display:inline-block;background:#6B003B;color:white;padding:15px 40px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">
            RESET PASSWORD
          </a>
        </div>
        <div style="background:#fff3cd;padding:15px;border-radius:8px;margin:20px 0;border:1px solid #ffc107;">
          <p style="margin:0;color:#856404;"><strong>Important:</strong> This link expires in 1 hour. If you did not request a password reset, please ignore this email.</p>
        </div>
      </div>
      <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#999;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} Edwardian Educational Consult. All rights reserved.</p>
      </div>
    </div>
  `;

  const success = await sendEmail({ to: email, name, subject, html, purpose: 'SECURITY' });
  await logEmail(email, subject, 'PASSWORD_RESET', success ? 'SENT' : 'FAILED');
  return success;
}

// ─── CBT result email ─────────────────────────────────────────────────────────

export async function sendCbtResultEmail(
  email: string,
  name: string,
  subject: string,
  score: number,
  total: number,
  percentage: number
): Promise<boolean> {
  const subjectLine = `CBT Result: ${subject}`;
  const color = percentage >= 50 ? '#059669' : '#dc2626';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#6B003B;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">CBT Result Available</h1>
      </div>
      <div style="padding:30px;background:#ffffff;">
        <h2>Hello ${name},</h2>
        <p>Your CBT result for <strong>${subject}</strong> is now available.</p>
        <div style="background:#f3f4f6;padding:20px;border-radius:8px;text-align:center;">
          <p style="font-size:48px;color:${color};margin:10px 0;">${Math.round(percentage)}%</p>
          <p>${score} out of ${total} questions correct</p>
        </div>
        <div style="text-align:center;margin:20px 0;">
          <a href="${FRONTEND_URL}/student/results"
             style="display:inline-block;background:#6B003B;color:white;padding:12px 30px;text-decoration:none;border-radius:8px;">
            View Full Result
          </a>
        </div>
      </div>
    </div>
  `;

  const success = await sendEmail({ to: email, name, subject: subjectLine, html, purpose: 'NOTIFICATION' });
  await logEmail(email, subjectLine, 'CBT_RESULT', success ? 'SENT' : 'FAILED');
  return success;
}

// ─── Payment receipt email ────────────────────────────────────────────────────

export async function sendPaymentReceiptEmail(
  email: string,
  name: string,
  amount: number,
  reference: string,
  description?: string
): Promise<boolean> {
  const subject = 'Payment Receipt - Edwardian Educational Consult';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#6B003B;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">Payment Confirmed</h1>
      </div>
      <div style="padding:30px;background:#ffffff;">
        <h2>Hello ${name},</h2>
        <p>Your payment has been successfully processed.</p>
        <div style="background:#f3f4f6;padding:20px;border-radius:8px;">
          <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
          <p><strong>Reference:</strong> ${reference}</p>
          <p><strong>Description:</strong> ${description || 'Payment'}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div style="text-align:center;margin:20px 0;">
          <a href="${FRONTEND_URL}/student/wallet"
             style="display:inline-block;background:#6B003B;color:white;padding:12px 30px;text-decoration:none;border-radius:8px;">
            View Receipt
          </a>
        </div>
      </div>
    </div>
  `;

  const success = await sendEmail({ to: email, name, subject, html, purpose: 'NOTIFICATION' });
  await logEmail(email, subject, 'PAYMENT_RECEIPT', success ? 'SENT' : 'FAILED');
  return success;
}

// ─── Notification email ───────────────────────────────────────────────────────

export async function sendNotificationEmail(
  email: string,
  name: string,
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string
): Promise<boolean> {
  const subject = title;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#6B003B;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">Edwardian Educational Consult</h1>
      </div>
      <div style="padding:30px;background:#ffffff;">
        <h2>Hello ${name},</h2>
        <p style="font-size:16px;color:#333;">${message}</p>
        ${actionUrl ? `
        <div style="text-align:center;margin:20px 0;">
          <a href="${actionUrl}"
             style="display:inline-block;background:#6B003B;color:white;padding:12px 30px;text-decoration:none;border-radius:8px;">
            ${actionText || 'View Details'}
          </a>
        </div>
        ` : ''}
      </div>
      <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#999;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} Edwardian Educational Consult. All rights reserved.</p>
      </div>
    </div>
  `;

  const success = await sendEmail({ to: email, name, subject, html, purpose: 'NOTIFICATION' });
  await logEmail(email, subject, 'NOTIFICATION', success ? 'SENT' : 'FAILED');
  return success;
}

// ─── Broadcast email ──────────────────────────────────────────────────────────

export async function sendBroadcastEmail(
  recipients: EmailRecipient[],
  subject: string,
  html: string
): Promise<boolean> {
  let success = true;
  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient.email,
      name: recipient.name,
      subject,
      html,
      purpose: 'NOTIFICATION',
    });
    if (!result) success = false;
  }
  return success;
}

// ─── Template processor ───────────────────────────────────────────────────────

export async function processEmailTemplate(
  template: string,
  variables: Record<string, string>
): Promise<string> {
  let processed = template;
  for (const [key, value] of Object.entries(variables)) {
    processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return processed;
}
