const { randomBytes, scrypt: deriveKey, timingSafeEqual } = require('crypto');
const { promisify } = require('util');
const scrypt = promisify(deriveKey);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${key.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;
  if (!stored.startsWith('scrypt$')) return stored === password;
  const [, salt, value] = stored.split('$');
  if (!salt || !/^[a-f0-9]{128}$/.test(value || '')) return false;
  const key = await scrypt(password, salt, 64);
  return timingSafeEqual(key, Buffer.from(value, 'hex'));
}

module.exports = { hashPassword, verifyPassword };
