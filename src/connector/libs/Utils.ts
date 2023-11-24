import sha256 from "fast-sha256";
import JWT from 'jsonwebtoken';
// import crypto from 'crypto'

export const getKeyFromUserId = (userId: number, salt: string = "key-salt") => {
  const userKey = Buffer.from(sha256(Uint8Array.from(Buffer.from(`${salt}-${userId}`, "utf-8")))).toString("hex")
  return `OGC:U_${userKey}`;
}

export const checkLogInUser = (token: string) => {
  const check = JWT.verify(token, String(process.env.JWT_SECRET_KEY), { ignoreExpiration: true });
  if (check && typeof check == "object" && check.exp && check.exp > new Date().getTime() / 1000 && check['userId']) {
    return { userId: check.userId };
  }
  return { userId: null }
}
