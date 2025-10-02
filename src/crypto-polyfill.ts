// src/crypto-polyfill.ts
import { randomBytes } from 'crypto';

console.log('🔧 Initializing crypto polyfill for Railway...');

// Global crypto polyfill
if (typeof global.crypto === 'undefined') {
  console.log('🚨 Crypto not found - applying polyfill');

  global.crypto = {
    getRandomValues: (array: any) => {
      return randomBytes(array.length);
    },
    randomUUID: (): string => {
      const bytes = randomBytes(16);
      // Set version (4) and variant (10) bits
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

      return [
        bytes.toString('hex', 0, 4),
        bytes.toString('hex', 4, 6),
        bytes.toString('hex', 6, 8),
        bytes.toString('hex', 8, 10),
        bytes.toString('hex', 10, 16),
      ].join('-');
    },
  } as any;

  console.log('✅ Crypto polyfill applied successfully');
} else {
  console.log('✅ Crypto is already available');
}

console.log(
  `🔧 Crypto check: ${typeof crypto !== 'undefined' ? 'Available' : 'Missing'}`,
);
console.log(
  `🔧 randomUUID check: ${typeof crypto.randomUUID === 'function' ? 'Available' : 'Missing'}`,
);
