"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ─── Config ──────────────────────────────────────────────────────────────────
const WHOHOST_API_URL = process.env.WHOHOST_API_URL || '';
const WHOHOST_USERNAME = process.env.WHOHOST_USERNAME || '';
const WHOHOST_API_TOKEN = process.env.WHOHOST_API_TOKEN || '';
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'edwardianeducationalconsult.com.ng';
// Default SMTP — used when the caller does not supply their own smtp* fields
const DEFAULT_SMTP_HOST = process.env.SMTP_HOST || 'mail.edwardianeducationalconsult.com.ng';
const DEFAULT_SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const DEFAULT_SMTP_USER = process.env.SMTP_USER || '';
const DEFAULT_SMTP_PASS = process.env.SMTP_PASS || '';
const API_KEY = process.env.EMAIL_API_KEY || '';
// ─── Auth middleware ─────────────────────────────────────────────────────────
// Protects all routes below this point. Skip if no API_KEY is configured
// (so local dev without a key still works).
function requireApiKey(req, res, next) {
    if (!API_KEY) {
        // No key set → open (useful for local dev)
        return next();
    }
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (token !== API_KEY) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
}
// ─── Health (public — no auth needed) ────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Edwardian Email Service' });
});
// ─── Apply auth to all other routes ─────────────────────────────────────────
app.use(requireApiKey);
// ─── Helper: build a transporter ─────────────────────────────────────────────
function buildTransporter(host, port, user, pass) {
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
    });
}
// ─── POST /send ───────────────────────────────────────────────────────────────
// Called by backend/src/lib/email.ts for ALL non-welcome emails:
//   2FA codes, password resets, CBT results, payment receipts, notifications.
//
// Body:
//   { to, subject, html, from?, name?,
//     smtpHost?, smtpPort?, smtpUser?, smtpPass? }
app.post('/send', async (req, res) => {
    try {
        const { to, subject, html, from, smtpHost = DEFAULT_SMTP_HOST, smtpPort = DEFAULT_SMTP_PORT, smtpUser = DEFAULT_SMTP_USER, smtpPass = DEFAULT_SMTP_PASS, } = req.body;
        if (!to || !subject || !html) {
            return res.status(400).json({ success: false, message: 'to, subject, and html are required' });
        }
        if (!smtpUser || !smtpPass) {
            return res.status(500).json({ success: false, message: 'SMTP credentials not configured' });
        }
        const transporter = buildTransporter(smtpHost, smtpPort, smtpUser, smtpPass);
        const fromAddress = from || `"Edwardian Educational Consult" <${smtpUser}>`;
        const info = await transporter.sendMail({
            from: fromAddress,
            to,
            subject,
            html,
        });
        console.log(`[/send] Email sent to ${to} — MessageId: ${info.messageId}`);
        return res.json({ success: true, messageId: info.messageId });
    }
    catch (error) {
        console.error('[/send] Error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
});
// ─── POST /send-welcome ───────────────────────────────────────────────────────
// Called directly from backend/src/routes/auth.routes.ts after registration.
app.post('/send-welcome', async (req, res) => {
    try {
        const { registeredEmail, name, portalId, password, parentCode, studentEmail } = req.body;
        if (!registeredEmail || !name || !portalId || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        if (!DEFAULT_SMTP_USER || !DEFAULT_SMTP_PASS) {
            return res.status(500).json({ success: false, message: 'SMTP credentials not configured' });
        }
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
                <td style="padding:8px 0;color:#333;">${registeredEmail}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666;"><strong>Password:</strong></td>
                <td style="padding:8px 0;color:#333;font-family:monospace;background:#eee;padding:5px 10px;border-radius:4px;">${password}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666;"><strong>Parent Access Code:</strong></td>
                <td style="padding:8px 0;color:#333;">${parentCode}</td>
              </tr>
              ${studentEmailRow}
            </table>
          </div>

          <div style="background:#fff3cd;padding:15px;border-radius:8px;margin:20px 0;border:1px solid #ffc107;">
            <p style="margin:0;color:#856404;"><strong>Important:</strong> Please save your password securely. You can change it after logging in.</p>
          </div>

          <div style="text-align:center;margin:30px 0;">
            <a href="${process.env.FRONTEND_URL}/login"
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
        const transporter = buildTransporter(DEFAULT_SMTP_HOST, DEFAULT_SMTP_PORT, DEFAULT_SMTP_USER, DEFAULT_SMTP_PASS);
        const info = await transporter.sendMail({
            from: `"Edwardian Educational Consult" <${DEFAULT_SMTP_USER}>`,
            to: registeredEmail,
            subject: 'Welcome to Edwardian Educational Consult - Your Account Details',
            html,
        });
        console.log(`[/send-welcome] Email sent to ${registeredEmail} — MessageId: ${info.messageId}`);
        return res.json({ success: true, messageId: info.messageId });
    }
    catch (error) {
        console.error('[/send-welcome] Error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
});
// ─── POST /create-account ─────────────────────────────────────────────────────
// Creates a cPanel/Whohost email account for the student.
app.post('/create-account', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }
        if (!WHOHOST_API_URL || !WHOHOST_USERNAME || !WHOHOST_API_TOKEN) {
            return res.json({ success: false, message: 'Whohost API not configured' });
        }
        const username = email.split('@')[0];
        const params = new URLSearchParams({
            email: username,
            password,
            domain: EMAIL_DOMAIN,
            quota: '100',
            send_welcome_email: '0',
        });
        const url = `${WHOHOST_API_URL}/execute/Email/add_pop?${params.toString()}`;
        console.log('[/create-account] Creating email account:', email);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `cpanel ${WHOHOST_USERNAME}:${WHOHOST_API_TOKEN}`,
                Accept: 'application/json',
            },
        });
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const html = await response.text();
            console.error('[/create-account] Whohost returned non-JSON:', html.substring(0, 500));
            return res.json({ success: false, message: 'Whohost API error — check API token and URL' });
        }
        const data = await response.json();
        if (data.status === 1 || data.errors === null) {
            return res.json({ success: true, message: 'Email account created' });
        }
        const errMsg = data.errors?.[0] || 'Unknown Whohost error';
        return res.json({ success: false, message: errMsg });
    }
    catch (error) {
        console.error('[/create-account] Error:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
});
// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Edwardian Email Service running on port ${PORT}`);
});
exports.default = app;
