import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);

  // Compare using timingSafeEqual to prevent timing attacks
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
