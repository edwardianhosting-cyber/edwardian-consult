import prisma from './prisma';

const TERMII_API_KEY = process.env.TERMII_API_KEY || '';
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'EdwardIan';
const TERMII_BASE_URL = 'https://api.ng.termii.com/api';

export interface SmsOptions {
  to: string;
  message: string;
  smsType?: 'CBT_RESULT' | 'PAYMENT_REMINDER' | 'ATTENDANCE' | 'GENERAL';
}

export async function sendSms(options: SmsOptions): Promise<boolean> {
  if (!TERMII_API_KEY) {
    console.warn('TERMII_API_KEY not set, skipping SMS send');
    return false;
  }

  try {
    const response = await fetch(`${TERMII_BASE_URL}/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TERMII_API_KEY,
        to: formatPhoneNumber(options.to),
        from: TERMII_SENDER_ID,
        type: 'plain',
        channel: 'generic',
        sms: options.message,
      }),
    });

    const data: any = await response.json();
    const success = response.ok && data.message === 'Successfully Sent';

    await logSms(options.to, options.message, options.smsType || 'GENERAL', success ? 'SENT' : 'FAILED');
    return success;
  } catch (error) {
    console.error('SMS send error:', error);
    await logSms(options.to, options.message, options.smsType || 'GENERAL', 'FAILED', String(error));
    return false;
  }
}

async function logSms(
  recipient: string,
  message: string,
  smsType: string,
  status: 'SENT' | 'FAILED',
  errorMsg?: string
) {
  return prisma.smsLog.create({
    data: {
      recipient,
      message,
      smsType,
      status,
      errorMsg,
    },
  });
}

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  } else if (!cleaned.startsWith('234')) {
    cleaned = '234' + cleaned;
  }

  return cleaned;
}

export async function sendCbtResultSms(
  phone: string,
  studentName: string,
  subject: string,
  score: number,
  total: number
): Promise<boolean> {
  const message = `Hi! ${studentName}'s CBT result for ${subject} is ready. Score: ${score}/${total} (${Math.round((score / total) * 100)}%).`;
  return sendSms({ to: phone, message, smsType: 'CBT_RESULT' });
}

export async function sendPaymentReminderSms(
  phone: string,
  studentName: string,
  amount: number,
  dueDate?: string
): Promise<boolean> {
  const message = `Dear Parent, ${studentName}'s tuition fee of ₦${amount.toLocaleString()} is due${dueDate ? ` on ${dueDate}` : ''}. Please make payment.`;
  return sendSms({ to: phone, message, smsType: 'PAYMENT_REMINDER' });
}

export async function sendAttendanceSms(
  phone: string,
  studentName: string,
  date: string,
  status: 'present' | 'absent' | 'late'
): Promise<boolean> {
  const message = `Attendance Notice: ${studentName} was marked ${status} on ${date}.`;
  return sendSms({ to: phone, message, smsType: 'ATTENDANCE' });
}
