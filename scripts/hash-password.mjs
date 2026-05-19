#!/usr/bin/env node
// Generate a password hash for a Portea admin user.
//
// Usage:
//   node scripts/hash-password.mjs
//
// You'll be prompted for an email, name, role and password. The script
// prints a JSON object you can paste into the PORTEA_USERS_JSON env var.
//
// The hash format (pbkdf2$iterations$salt$hash) matches what
// src/lib/admin-auth.ts expects.

import crypto from "node:crypto";
import readline from "node:readline";

const PBKDF2_ITERATIONS = 210_000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = "sha256";

function hashPassword(plain) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(
    plain,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST,
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function prompt(rl, question, { mask = false } = {}) {
  return new Promise((resolve) => {
    if (!mask) {
      rl.question(question, (answer) => resolve(answer));
      return;
    }
    // Naive masked input for passwords.
    const stdin = process.stdin;
    process.stdout.write(question);
    let value = "";
    const onData = (buf) => {
      const ch = buf.toString();
      if (ch === "\n" || ch === "\r" || ch === "\r\n") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(value);
      } else if (ch === "") {
        process.exit(130);
      } else if (ch === "" || ch === "\b") {
        value = value.slice(0, -1);
      } else {
        value += ch;
      }
    };
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const email = (await prompt(rl, "Email: ")).trim().toLowerCase();
const name = (await prompt(rl, "Display name: ")).trim();
const roleRaw = (await prompt(rl, "Role [admin/cm] (default cm): ")).trim().toLowerCase();
const role = roleRaw === "admin" ? "admin" : "cm";
const password = await prompt(rl, "Password: ", { mask: true });
const confirm = await prompt(rl, "Confirm password: ", { mask: true });

rl.close();

if (!email || !name || !password) {
  console.error("\nEmail, name and password are required.");
  process.exit(1);
}
if (password !== confirm) {
  console.error("\nPasswords do not match.");
  process.exit(1);
}
if (password.length < 8) {
  console.error("\nPasswords must be at least 8 characters.");
  process.exit(1);
}

const id = "u_" + email.replace(/[^a-z0-9]+/g, "_");
const user = {
  id,
  email,
  name,
  role,
  password_hash: hashPassword(password),
};

console.log("\n--- User entry ---");
console.log(JSON.stringify(user, null, 2));
console.log("\n--- Add this to your PORTEA_USERS_JSON array on Vercel ---");
console.log(JSON.stringify(user));
console.log("");
