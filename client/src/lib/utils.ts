import { scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function comparePasswords(plainText: string, hashed: string): Promise<boolean> {
  const [hash, salt] = hashed.split('.');
  const buf = (await scryptAsync(plainText, salt, 64)) as Buffer;
  return buf.toString('hex') === hash;
}
