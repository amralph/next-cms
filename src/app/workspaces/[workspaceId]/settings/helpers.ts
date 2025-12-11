import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export function encrypt(text: string) {
  const iv = randomBytes(16); // 16 bytes for AES
  const keyInBytes = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32-byte hex key
  const cipher = createCipheriv('aes-256-cbc', keyInBytes, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  // Combine IV and ciphertext as hex, separated by ':'
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt function
export function decrypt(encryptedText: string) {
  const [ivHex, encryptedHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const keyInBytes = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', keyInBytes, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
