import prisma from './prisma';

const WHOHOST_API_URL = process.env.WHOHOST_API_URL || '';
const WHOHOST_USERNAME = process.env.WHOHOST_USERNAME || '';
const WHOHOST_API_TOKEN = process.env.WHOHOST_API_TOKEN || '';
const DOMAIN = process.env.EMAIL_DOMAIN || 'edwardianeducationalconsult.com.ng';

interface EmailAccountResult {
  success: boolean;
  email: string;
  message: string;
}

interface WhohostResponse {
  status?: number;
  errors?: string[] | null;
  data?: any;
}

export function generateStudentEmail(fullName: string, portalId: string): string {
  const surname = fullName.split(' ')[0]?.toLowerCase() || 'student';
  const cleanSurname = surname.replace(/[^a-z]/g, '');
  const portalNumber = portalId.split('/').pop() || '0000';
  return `${cleanSurname}${portalNumber}@${DOMAIN}`;
}

export async function createStudentEmailAccount(
  email: string,
  password: string
): Promise<EmailAccountResult> {
  if (!WHOHOST_API_URL || !WHOHOST_USERNAME || !WHOHOST_API_TOKEN) {
    console.warn('Whohost API credentials not configured');
    return {
      success: false,
      email,
      message: 'Whohost API not configured',
    };
  }

  try {
    const cpanelUrl = `${WHOHOST_API_URL}/execute/Email/add_pop`;

    const params = new URLSearchParams({
      email: email.split('@')[0],
      password: password,
      domain: DOMAIN,
      quota: '100',
      send_welcome_email: '0',
    });

    const response = await fetch(`${cpanelUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `cpanel ${WHOHOST_USERNAME}:${WHOHOST_API_TOKEN}`,
      },
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const htmlText = await response.text();
      console.error('Whohost API returned non-JSON response:', htmlText.substring(0, 200));
      return {
        success: false,
        email,
        message: 'Whohost API error: Invalid response format',
      };
    }

    const data = await response.json() as WhohostResponse;

    if (data.status === 1 || data.errors === null) {
      console.log(`Email account created: ${email}`);
      return {
        success: true,
        email,
        message: 'Email account created successfully',
      };
    } else {
      const errorMsg = data.errors?.[0] || 'Unknown error';
      console.error(`Failed to create email: ${errorMsg}`);
      return {
        success: false,
        email,
        message: errorMsg,
      };
    }
  } catch (error: any) {
    console.error('Whohost API error:', error);
    return {
      success: false,
      email,
      message: error.message || 'API request failed',
    };
  }
}

export async function deleteStudentEmailAccount(email: string): Promise<boolean> {
  if (!WHOHOST_API_URL || !WHOHOST_USERNAME || !WHOHOST_API_TOKEN) {
    return false;
  }

  try {
    const cpanelUrl = `${WHOHOST_API_URL}/execute/Email/delete_pop`;

    const params = new URLSearchParams({
      email: email.split('@')[0],
      domain: DOMAIN,
    });

    const response = await fetch(`${cpanelUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `cpanel ${WHOHOST_USERNAME}:${WHOHOST_API_TOKEN}`,
      },
    });

    const data = await response.json() as WhohostResponse;
    return data.status === 1;
  } catch (error) {
    console.error('Failed to delete email account:', error);
    return false;
  }
}

export async function changeEmailPassword(
  email: string,
  newPassword: string
): Promise<boolean> {
  if (!WHOHOST_API_URL || !WHOHOST_USERNAME || !WHOHOST_API_TOKEN) {
    return false;
  }

  try {
    const cpanelUrl = `${WHOHOST_API_URL}/execute/Email/passwd_pop`;

    const params = new URLSearchParams({
      email: email.split('@')[0],
      password: newPassword,
      domain: DOMAIN,
    });

    const response = await fetch(`${cpanelUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `cpanel ${WHOHOST_USERNAME}:${WHOHOST_API_TOKEN}`,
      },
    });

    const data = await response.json() as WhohostResponse;
    return data.status === 1;
  } catch (error) {
    console.error('Failed to change email password:', error);
    return false;
  }
}

export async function listEmailAccounts(): Promise<string[]> {
  if (!WHOHOST_API_URL || !WHOHOST_USERNAME || !WHOHOST_API_TOKEN) {
    return [];
  }

  try {
    const cpanelUrl = `${WHOHOST_API_URL}/execute/Email/list_pops`;

    const params = new URLSearchParams({
      domain: DOMAIN,
    });

    const response = await fetch(`${cpanelUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `cpanel ${WHOHOST_USERNAME}:${WHOHOST_API_TOKEN}`,
      },
    });

    const data = await response.json() as WhohostResponse;

    if (data.status === 1 && data.data) {
      return data.data.map((account: any) => `${account.email}@${DOMAIN}`);
    }
    return [];
  } catch (error) {
    console.error('Failed to list email accounts:', error);
    return [];
  }
}
