import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const VALID_USER = "manuel";
const VALID_PASS = "moebius666";

export function validateCredentials(username: string, password: string): boolean {
  return username === VALID_USER && password === VALID_PASS;
}

export async function createToken(): Promise<string> {
  return new SignJWT({ sub: "manuel" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
