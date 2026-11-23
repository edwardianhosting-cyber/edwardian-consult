const { SMTPServer } = require('smtp-server');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SMTP_PORT = 1025;
const HTTP_PORT = 8025;

const emails = [];

const server = new SMTPServer({
  secure: false,
  authOptional: true,
  onAuth(auth, session, callback) {
    // Accept any username/password for local development
    callback(null, { user: auth.username });
  },
  onData(stream, session, callback) {
    let emailData = '';
    stream.on('data', chunk => {
      emailData += chunk;
    });
    stream.on('end', () => {
      const email = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        from: session.envelope.mailFrom?.address || 'unknown',
        to: session.envelope.rcptTo.map(r => r.address),
        raw: emailData,
      };
      
      // Parse basic headers
      const headersEnd = emailData.indexOf('\r\n\r\n');
      if (headersEnd > 0) {
        const headers = emailData.substring(0, headersEnd);
        const body = emailData.substring(headersEnd + 4);
        
        const subjectMatch = headers.match(/^Subject:\s*(.+)$/im);
        email.subject = subjectMatch ? subjectMatch[1] : '(no subject)';
        
        // Extract HTML body
        const htmlMatch = body.match(/<html[\s\S]*<\/html>/i) || body.match(/<body[\s\S]*<\/body>/i);
        email.html = htmlMatch ? htmlMatch[0] : body;
        email.text = body.replace(/<[^>]*>/g, '').trim();
      }
      
      emails.unshift(email);
      if (emails.length > 100) emails.pop();
      
      console.log(`[SMTP] Received email: ${email.subject} to ${email.to.join(', ')}`);
      callback();
    });
    stream.on('error', callback);
  },
});

server.listen(SMTP_PORT, () => {
  console.log(`[SMTP] Server listening on port ${SMTP_PORT}`);
});

server.on('error', err => {
  console.error('[SMTP] Error:', err);
});

// HTTP server for web UI
const httpServer = http.createServer((req, res) => {
  const url = req.url || '/';
  
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(generateHTML(emails));
  } else if (url === '/api/emails') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(emails));
  } else if (url.startsWith('/api/email/')) {
    const id = url.split('/api/email/')[1];
    const email = emails.find(e => e.id === id);
    if (email) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(email));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`[HTTP] Web UI available at http://localhost:${HTTP_PORT}`);
});

function generateHTML(emails) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Local Mail Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
    header { background: #6B003B; color: white; padding: 20px; }
    h1 { margin: 0; font-size: 1.5rem; }
    .email-list { border-top: 1px solid #eee; }
    .email-item { padding: 16px 20px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s; }
    .email-item:hover { background: #f9f9f9; }
    .email-item.selected { background: #fff5fa; border-left: 3px solid #6B003B; }
    .email-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .email-subject { font-weight: 600; color: #333; }
    .email-meta { color: #666; font-size: 0.85rem; }
    .email-preview { color: #888; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .email-detail { display: none; padding: 20px; border-top: 1px solid #eee; background: #fafafa; }
    .email-detail.visible { display: block; }
    .detail-field { margin-bottom: 12px; }
    .detail-label { font-weight: 600; color: #333; margin-bottom: 4px; }
    .detail-value { color: #666; word-break: break-all; }
    .email-body { border: 1px solid #ddd; border-radius: 4px; padding: 16px; max-height: 500px; overflow: auto; background: white; }
    .refresh-btn { background: #6B003B; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .refresh-btn:hover { background: #97005f; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📧 Local Mail Server</h1>
      <p>SMTP: localhost:1025 | Emails received: ${emails.length}</p>
    </header>
    <div class="email-list" id="emailList">
      ${emails.map((email, i) => `
        <div class="email-item" data-id="${email.id}" onclick="selectEmail('${email.id}')">
          <div class="email-header">
            <span class="email-subject">${escapeHtml(email.subject)}</span>
            <span class="email-meta">${new Date(email.timestamp).toLocaleString()}</span>
          </div>
          <div class="email-meta">To: ${email.to.join(', ')}</div>
          <div class="email-preview">${escapeHtml(email.text?.substring(0, 100) || '')}...</div>
        </div>
      `).join('') || '<div class="email-item" style="text-align:center;color:#999;padding:40px;">No emails received yet</div>'}
    </div>
    <div id="emailDetail" class="email-detail"></div>
  </div>
  <script>
    let selectedId = null;
    async function selectEmail(id) {
      document.querySelectorAll('.email-item').forEach(el => el.classList.remove('selected'));
      document.querySelector('[data-id="' + id + '"]').classList.add('selected');
      
      const res = await fetch('/api/email/' + id);
      const email = await res.json();
      
      const detail = document.getElementById('emailDetail');
      detail.className = 'email-detail visible';
      detail.innerHTML = \`
        <div class="detail-field"><div class="detail-label">Subject</div><div class="detail-value">\${escapeHtml(email.subject)}</div></div>
        <div class="detail-field"><div class="detail-label">From</div><div class="detail-value">\${escapeHtml(email.from)}</div></div>
        <div class="detail-field"><div class="detail-label">To</div><div class="detail-value">\${escapeHtml(email.to.join(', '))}</div></div>
        <div class="detail-field"><div class="detail-label">Time</div><div class="detail-value">\${new Date(email.timestamp).toLocaleString()}</div></div>
        <div class="detail-field"><div class="detail-label">Body (HTML)</div><div class="email-body">\${email.html || escapeHtml(email.text)}</div></div>
        <div class="detail-field"><div class="detail-label">Raw</div><pre style="background:#f5f5f5;padding:10px;max-height:200px;overflow:auto;font-size:0.75rem;">\${escapeHtml(email.raw)}</pre></div>
      \`;
      selectedId = id;
    }
    function escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '&#039;');
    }
    setInterval(async () => {
      const res = await fetch('/api/emails');
      const emails = await res.json();
      if (emails.length !== document.querySelectorAll('.email-item').length - (emails.length===0?0:0)) {
        location.reload();
      }
    }, 3000);
  </script>
</body>
</html>
`;
}

console.log('Local mail server started. Press Ctrl+C to stop.');