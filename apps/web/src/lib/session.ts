import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.MAGIC_LINK_SECRET!);

export async function verifySession(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { clockTolerance: 60 });
    return { email: payload.email as string };
  } catch {
    return null;
  }
}
