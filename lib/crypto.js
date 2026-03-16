/**
 * AES-256-GCM Encryption Utility
 * Provides end-to-end payload encryption for sensitive fields.
 * Uses AES-256-GCM (authenticated encryption) for both confidentiality and integrity.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12;  // 96 bits (recommended for GCM)
const TAG_LENGTH = 16; // 128 bits auth tag

function getKey() {
   const rawKey = process.env.ENCRYPTION_KEY || 'taskflow_enc_key_32chars_2026!!!';
  if (!rawKey) throw new Error('ENCRYPTION_KEY environment variable not set');
  // Derive a consistent 32-byte key using scryptSync
  return crypto.scryptSync(rawKey, process.env.ENCRYPTION_IV_SALT || 'taskmgr_salt_16!', KEY_LENGTH);
}

/**
 * Encrypts a string value using AES-256-GCM
 * Returns: base64(iv:authTag:ciphertext)
 */
export function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined) return plaintext;
  const text = typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext);
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  // Pack: iv (12) + authTag (16) + ciphertext
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypts an AES-256-GCM encrypted string
 */
export function decrypt(encryptedData) {
  if (!encryptedData) return encryptedData;
  try {
    const combined = Buffer.from(encryptedData, 'base64');
    const key = getKey();
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    throw new Error('Decryption failed: invalid or tampered data');
  }
}

/**
 * Encrypts specified fields of an object
 */
export function encryptFields(obj, fields) {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = encrypt(String(result[field]));
    }
  }
  return result;
}

/**
 * Decrypts specified fields of an object
 */
export function decryptFields(obj, fields) {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = decrypt(String(result[field]));
    }
  }
  return result;
}

/**
 * Client-side encryption helper (uses Web Crypto API)
 * Call this from the browser before sending sensitive data.
 */
export async function clientEncrypt(plaintext, keyBase64) {
  const keyBuffer = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function clientDecrypt(encryptedBase64, keyBase64) {
  const keyBuffer = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-GCM' }, false, ['decrypt']);
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}
