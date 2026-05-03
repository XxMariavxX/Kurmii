import crypto from "node:crypto";
import createLogger from "../lib/logger.js";

const log = createLogger({ level: "INFO" });

const usersDb = new Map([
  ["admin", { passwordHash: crypto.createHash("sha256").update("admin123").digest("hex"), role: "admin" }],
]);

const tokens = new Map();

const generateToken = () => crypto.randomBytes(32).toString("hex");

export const loginUser = (username, password) => {
  const user = usersDb.get(username);
  if (!user) return { success: false, error: "Incorrect login or password" };

  const hash = crypto.createHash("sha256").update(password).digest("hex");
  if (hash !== user.passwordHash) return { success: false, error: "Incorrect login or password" };

  const token = generateToken();
  tokens.set(token, { username, role: user.role, createdAt: Date.now() });

  return { success: true, token };
};

function verifyTokenFn(token) {
  const entry = tokens.get(token);
  if (!entry) return null;

  const TTL = 24 * 60 * 60 * 1000;
  if (Date.now() - entry.createdAt > TTL) {
    tokens.delete(token);
    return null;
  }

  return entry;
}

export const verifyToken = log(verifyTokenFn);
export const revokeToken = log(function revokeToken(token) { return tokens.delete(token); });

export const registerUser = (username, password) => {
  if (!username || typeof username !== "string" || username.length < 3 || username.length > 32) {
    return { success: false, error: "Username must be 3–32 characters" };
  }
  if (!password || typeof password !== "string" || password.length < 4) {
    return { success: false, error: "Password must be at least 4 characters" };
  }
  if (usersDb.has(username)) {
    return { success: false, error: "Username already taken" };
  }

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  usersDb.set(username, { passwordHash, role: "user" });

  const token = generateToken();
  tokens.set(token, { username, role: "user", createdAt: Date.now() });

  return { success: true, token };
};