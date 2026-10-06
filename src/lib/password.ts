import bcrypt from "bcryptjs";

// bcryptjs is pure JavaScript, so it deploys cleanly to serverless (no native
// binaries to compile). Cost factor 12 is a good balance for a small portal.
const ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
