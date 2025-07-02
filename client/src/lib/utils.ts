import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ Add this to handle password checking
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const [hashed, salt] = hashedPassword.split(".");
  if (!hashed || !salt) return false;

  const buf = (await scryptAsync(plainPassword, salt, 64)) as Buffer;
  return buf.toString("hex") === hashed;
}
