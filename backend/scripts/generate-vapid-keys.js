// Generates a VAPID key pair for Web Push, using only Node's built-in crypto
// (no extra dependency needed just to run this once).
//
// Usage:  node scripts/generate-vapid-keys.js
//
// Copy the two output lines into your .env file. Anyone with the private key
// can send push notifications "as you", so keep it out of git and out of the
// frontend — only VAPID_PUBLIC_KEY is ever exposed to the browser.

const crypto = require('crypto');

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });

// Web Push wants the raw 65-byte uncompressed EC point for the public key,
// and the raw 32-byte scalar for the private key — not the PEM/DER wrappers
// Node gives by default, so we pull them out of the SPKI / PKCS8 DER.
const spki = publicKey.export({ type: 'spki', format: 'der' });
const rawPublicKey = spki.subarray(spki.length - 65);

const pkcs8 = privateKey.export({ type: 'pkcs8', format: 'der' });
let rawPrivateKey = null;
for (let i = 0; i < pkcs8.length - 1; i++) {
  // Find the OCTET STRING (tag 0x04) of length 32 (0x20) that holds the scalar.
  if (pkcs8[i] === 0x04 && pkcs8[i + 1] === 0x20) {
    rawPrivateKey = pkcs8.subarray(i + 2, i + 2 + 32);
    break;
  }
}

if (!rawPrivateKey) {
  throw new Error('Failed to extract private key — please retry.');
}

console.log('VAPID_PUBLIC_KEY=' + base64url(rawPublicKey));
console.log('VAPID_PRIVATE_KEY=' + base64url(rawPrivateKey));
console.log('VAPID_SUBJECT=mailto:registrar@edwardianeducationalconsult.com.ng');
