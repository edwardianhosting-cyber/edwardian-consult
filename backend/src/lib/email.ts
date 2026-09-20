import prisma from './prisma';

const SMTP_HOST = process.env.SMTP_HOST || 'mail.edwardianeducationalconsult.com.ng';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'registrar@edwardianeducationalconsult.com.ng';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'registrar@edwardianeducationalconsult.com.ng';
const FROM_NAME = process.env.MAILER_FROM_NAME || 'Edwardian Educational Consult';
const FRONTEND_URL = process.env.FRONTEND_URL;

export type EmailPurpose = 'REGISTRAR' | 'SECURITY' | 'NOTIFICATION';

export interface EmailRecipient {
  email: string;
  name?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  name?: string;
  purpose?: EmailPurpose;
}): Promise<boolean> {
  const { to, subject, html, purpose = 'NOTIFICATION' } = params;

  if (!SMTP_PASS) {
    console.warn('[email] SMTP_PASS not set — skipping email send');
    await logEmail(to, subject, purpose || 'NOTIFICATION', 'FAILED', 'SMTP_PASS not configured');
    return false;
  }

  if (!validateEmail(to)) {
    console.warn(`[email] Invalid email address: ${to}`);
    await logEmail(to, subject, purpose || 'NOTIFICATION', 'FAILED', 'Invalid email address');
    return false;
  }

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, '').trim(),
    });

    console.log(`[email] Sent "${subject}" to ${to}`);
    await logEmail(to, subject, purpose || 'NOTIFICATION', 'SENT');
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[email] Failed to send to ${to}:`, msg);
    await logEmail(to, subject, purpose || 'NOTIFICATION', 'FAILED', msg);
    return false;
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

// ─── Mock result email ─────────────────────────────────────────────────────────

export async function sendMockResultEmail(
  email: string,
  name: string,
  mockExamName: string,
  examType: string,
  score: number,
  percentage: number,
  correctAnswers: number,
  wrongAnswers: number,
  skippedAnswers: number,
  corrections: Array<{
    questionNumber: number;
    question: string;
    options: string[];
    correctOption: number;
    userAnswer: number;
    isCorrect: boolean;
    explanation?: string | null;
    topic?: string | null;
    subject: string;
  }>
): Promise<boolean> {
  const subjectLine = `Your Mock Exam Result - ${mockExamName}`;

  const correctSection = corrections
    .filter(c => c.isCorrect)
    .map(c => `
      <tr>
        <td style="padding:10px;border:1px solid #e5e7eb;">${c.questionNumber}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(c.question)}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;color:#059669;font-weight:bold;">${String.fromCharCode(65 + c.userAnswer)}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;color:#059669;font-weight:bold;">${String.fromCharCode(65 + c.correctOption)}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;color:#059669;font-weight:bold;">CORRECT</td>
      </tr>
    `).join('') || '<tr><td colspan="5" style="padding:10px;text-align:center;">No correct answers</td></tr>';

  const incorrectSection = corrections
    .filter(c => !c.isCorrect && c.userAnswer !== -1)
    .map(c => `
      <tr>
        <td style="padding:10px;border:1px solid #e5e7eb;">${c.questionNumber}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(c.question)}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;color:#dc2626;font-weight:bold;">${String.fromCharCode(65 + c.userAnswer)}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;color:#059669;font-weight:bold;">${String.fromCharCode(65 + c.correctOption)}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;color:#dc2626;font-weight:bold;">INCORRECT</td>
      </tr>
    `).join('') || '<tr><td colspan="5" style="padding:10px;text-align:center;">No incorrect answers</td></tr>';

  const unansweredSection = corrections
    .filter(c => c.userAnswer === -1)
    .map(c => `
      <tr>
        <td style="padding:10px;border:1px solid #e5e7eb;">${c.questionNumber}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(c.question)}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;color:#6b7280;font-weight:bold;">-</td>
        <td style="padding:10px;border:1px solid #e5e7eb;color:#059669;font-weight:bold;">${String.fromCharCode(65 + c.correctOption)}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;color:#6b7280;font-weight:bold;">UNANSWERED</td>
      </tr>
    `).join('') || '<tr><td colspan="5" style="padding:10px;text-align:center;">No unanswered questions</td></tr>';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;">
      <div style="background:#6B003B;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">Edwardian Educational Consult</h1>
        <p style="color:#FFD700;margin:10px 0 0 0;">Mock Exam Result</p>
      </div>
      <div style="padding:30px;background:#ffffff;">
        <h2>Hello ${name},</h2>
        <p>Your Mock Exam result for <strong>${mockExamName}</strong> is now available.</p>

        <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0;">
          <h3 style="margin-top:0;color:#6B003B;">Result Summary</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Mock Exam:</strong></td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(mockExamName)}</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Exam Type:</strong></td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(examType)}</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Date:</strong></td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${new Date().toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Score:</strong></td>
              <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;color:${percentage >= 50 ? '#059669' : '#dc2626'};">${Math.round(percentage)}%</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Correct:</strong></td>
              <td style="padding:8px;border:1px solid #e5e7eb;color:#059669;">${correctAnswers}</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Wrong:</strong></td>
              <td style="padding:8px;border:1px solid #e5e7eb;color:#dc2626;">${wrongAnswers}</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;"><strong>Unanswered:</strong></td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${skippedAnswers}</td>
            </tr>
          </table>
        </div>

        <h3 style="color:#6B003B;">Correct Answers</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">#</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Question</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Your Answer</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Correct Answer</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Status</th>
            </tr>
          </thead>
          <tbody>${correctSection}</tbody>
        </table>

        <h3 style="color:#6B003B;">Incorrect Answers</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">#</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Question</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Your Answer</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Correct Answer</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Status</th>
            </tr>
          </thead>
          <tbody>${incorrectSection}</tbody>
        </table>

        <h3 style="color:#6B003B;">Unanswered Questions</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">#</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Question</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Your Answer</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Correct Answer</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Status</th>
            </tr>
          </thead>
          <tbody>${unansweredSection}</tbody>
        </table>

        <div style="text-align:center;margin:20px 0;">
          <a href="${FRONTEND_URL}/student/mock-results"
             style="display:inline-block;background:#6B003B;color:white;padding:12px 30px;text-decoration:none;border-radius:8px;">
            View All Mock Results
          </a>
        </div>
      </div>
    </div>
  `;

  const success = await sendEmail({ to: email, name, subject: subjectLine, html, purpose: 'NOTIFICATION' });
  await logEmail(email, subjectLine, 'MOCK_RESULT', success ? 'SENT' : 'FAILED');
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
          ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
        </div>
        <p style="margin-top:20px;">Thank you for your payment.</p>
      </div>
    </div>
  `;

  const success = await sendEmail({ to: email, name, subject, html, purpose: 'NOTIFICATION' });
  await logEmail(email, subject, 'PAYMENT_RECEIPT', success ? 'SENT' : 'FAILED');
  return success;
}

// ─── Admission status email ───────────────────────────────────────────────────

export async function sendAdmissionStatusEmail(
  email: string,
  name: string,
  applicationId: string,
  status: string,
  programme?: string
): Promise<boolean> {
  const subject = `Admission Application ${status}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#6B003B;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">Admission Update</h1>
      </div>
      <div style="padding:30px;background:#ffffff;">
        <h2>Hello ${name},</h2>
        <p>Your admission application <strong>${applicationId}</strong> status has been updated to: <strong>${status}</strong></p>
        ${programme ? `<p><strong>Programme:</strong> ${programme}</p>` : ''}
        <p>Please log in to your portal for more details.</p>
        <div style="text-align:center;margin:20px 0;">
          <a href="${FRONTEND_URL}/login"
             style="display:inline-block;background:#6B003B;color:white;padding:12px 30px;text-decoration:none;border-radius:8px;">
            Login to Portal
          </a>
        </div>
      </div>
    </div>
  `;

  const success = await sendEmail({ to: email, name, subject, html, purpose: 'NOTIFICATION' });
  await logEmail(email, subject, 'ADMISSION_STATUS', success ? 'SENT' : 'FAILED');
  return success;
}

// ─── Certificate email ────────────────────────────────────────────────────────

export async function sendCertificateEmail(
  email: string,
  name: string,
  certificateId: string,
  certificateUrl: string
): Promise<boolean> {
  const subject = 'Your Certificate is Ready';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#6B003B;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">Certificate Ready</h1>
      </div>
      <div style="padding:30px;background:#ffffff;">
        <h2>Hello ${name},</h2>
        <p>Your certificate <strong>${certificateId}</strong> is now ready.</p>
        <div style="text-align:center;margin:20px 0;">
          <a href="${certificateUrl}"
             style="display:inline-block;background:#6B003B;color:white;padding:12px 30px;text-decoration:none;border-radius:8px;">
            Download Certificate
          </a>
        </div>
      </div>
    </div>
  `;

  const success = await sendEmail({ to: email, name, subject, html, purpose: 'NOTIFICATION' });
  await logEmail(email, subject, 'CERTIFICATE', success ? 'SENT' : 'FAILED');
  return success;
}

// ─── Notification email ───────────────────────────────────────────────────────

export async function sendNotificationEmail(
  email: string,
  name: string,
  title: string,
  message: string
): Promise<boolean> {
  const subject = title;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#6B003B;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:30px;background:#ffffff;">
        <h2 style="color:#333;">Hello ${name},</h2>
        <p>${escapeHtml(message)}</p>
      </div>
    </div>
  `;

  const success = await sendEmail({ to: email, name, subject, html, purpose: 'NOTIFICATION' });
  await logEmail(email, subject, 'NOTIFICATION', success ? 'SENT' : 'FAILED');
  return success;
}

export async function sendBroadcastEmail(
  recipients: Array<{ email: string; name?: string }>,
  subject: string,
  html: string
): Promise<boolean> {
  let allSent = true;

  for (const recipient of recipients) {
    const success = await sendEmail({
      to: recipient.email,
      subject,
      html,
      name: recipient.name,
      purpose: 'NOTIFICATION',
    });

    if (!success) {
      allSent = false;
    }
  }

  return allSent;
}

export function processEmailTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : '';
  });
}


function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
