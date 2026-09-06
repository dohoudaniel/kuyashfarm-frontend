#!/usr/bin/env node
/**
 * Fail the build if anything secret-shaped reached the client bundle.
 *
 * Next.js inlines every `NEXT_PUBLIC_*` variable into the JavaScript it serves,
 * so a secret put there is public the moment it ships — and the mistake is
 * invisible in review, because the code reading it looks identical to the code
 * reading a harmless value. It is also invisible to a normal secret scanner,
 * which examines the repository rather than the build output.
 *
 * This already caught one real leak: NEXT_PUBLIC_ADMIN_URL shipped the
 * back-office path to every anonymous visitor, defeating the entire purpose of
 * moving the admin off its default path. The link was rendered only for staff —
 * but the *value* was in the bundle for everyone.
 *
 * Run after `next build`. Exits non-zero on a finding.
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const BUILD_DIR = ".next/static";

/**
 * Patterns worth failing over. Each is a shape that should never be public,
 * not a guess at a variable name — someone will always invent a new name.
 */
const RULES = [
  { name: "Django secret key", re: /django-insecure-[A-Za-z0-9!@#$%^&*()_+=-]{20,}/ },
  { name: "Paystack secret key", re: /\bsk_(?:test|live)_[A-Za-z0-9]{20,}/ },
  { name: "Resend API key", re: /\bre_[A-Za-z0-9]{20,}/ },
  { name: "AWS access key id", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Private key block", re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "JWT", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: "Postgres connection string", re: /\bpostgres(?:ql)?:\/\/[^\s"'`]+:[^\s"'`]+@/ },
  { name: "Supabase service-role key", re: /\bservice_role\b/ },
  {
    name: "Django admin path",
    // The point of DJANGO_ADMIN_URL is that it is not guessable. Publishing it
    // in the bundle hands it to every scanner instead.
    re: /https?:\/\/[^\s"'`]*\/admin\//,
  },
];

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(js|mjs|css|json|txt|map)$/.test(entry.name)) yield path;
  }
}

const findings = [];
let scanned = 0;

for await (const file of walk(BUILD_DIR)) {
  scanned += 1;
  const contents = await readFile(file, "utf8");
  for (const rule of RULES) {
    const match = contents.match(rule.re);
    if (match) {
      findings.push({ file, rule: rule.name, sample: match[0].slice(0, 48) });
    }
  }
}

if (scanned === 0) {
  console.error(`No build output found in ${BUILD_DIR}. Run \`next build\` first.`);
  process.exit(1);
}

if (findings.length > 0) {
  console.error(`\nSecret-shaped values found in the client bundle (${scanned} files scanned):\n`);
  for (const { file, rule, sample } of findings) {
    console.error(`  ${rule}`);
    console.error(`    in ${file}`);
    console.error(`    ${sample}…\n`);
  }
  console.error(
    "NEXT_PUBLIC_* is inlined into JavaScript served to every visitor.\n" +
      "Move the value behind an authenticated API response instead.\n",
  );
  process.exit(1);
}

console.log(`No secrets in the client bundle (${scanned} files scanned).`);
