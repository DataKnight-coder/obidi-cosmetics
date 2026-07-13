import readline from "node:readline";
import { Writable } from "node:stream";
import bcrypt from "bcryptjs";
import { execSync } from "node:child_process";
import crypto from "node:crypto";

function maskedPrompt(query: string): Promise<string> {
  return new Promise((resolve) => {
    const mutableStdout = new Writable({
      write: function (chunk, encoding, callback) {
        if (!(this as any).muted) process.stdout.write(chunk, encoding);
        callback();
      },
    }) as Writable & { muted: boolean };
    
    mutableStdout.muted = false;

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true,
    });

    process.stdout.write(query);
    mutableStdout.muted = true;

    rl.question("", (password) => {
      mutableStdout.muted = false;
      process.stdout.write("\n");
      rl.close();
      resolve(password);
    });
  });
}

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function run() {
  console.log("=== Secure Admin Password Reset ===");
  const email = await askQuestion("Enter admin email to reset: ");
  if (!email || !email.includes("@")) {
    console.error("Invalid email address.");
    process.exit(1);
  }

  const password = await maskedPrompt("Enter new password: ");
  if (password.length < 8) {
    console.error("Password must be at least 8 characters long.");
    process.exit(1);
  }

  const confirmPassword = await maskedPrompt("Confirm new password: ");
  if (password !== confirmPassword) {
    console.error("Passwords do not match.");
    process.exit(1);
  }

  const envChoice = await askQuestion("Target environment (local / staging / production): ");
  if (!["local", "staging", "production"].includes(envChoice)) {
    console.error("Invalid environment selected. Aborting.");
    process.exit(1);
  }

  console.log("Hashing password...");
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const auditId = crypto.randomUUID();
  const dateStr = new Date().toISOString();

  // We perform the reset and increment sessionVersion so existing sessions are revoked
  // Also we add an audit log entry.
  // We use D1 execute. We must carefully construct the SQL avoiding SQL injection, but since we are generating it...
  const updateQuery = `
    UPDATE AdminUser 
    SET passwordHash = '${passwordHash}', sessionVersion = sessionVersion + 1 
    WHERE email = '${email.replace(/'/g, "''")}';
  `;
  
  const auditQuery = `
    INSERT INTO AdminAuditLog (id, adminId, action, details, createdAt)
    SELECT '${auditId}', id, 'PASSWORD_RESET', '{"source":"CLI_RESET"}', '${dateStr}'
    FROM AdminUser WHERE email = '${email.replace(/'/g, "''")}';
  `;

  // We write the queries to a temporary SQL file to run via wrangler
  const fs = await import("fs/promises");
  const tmpFile = ".reset-tmp.sql";
  await fs.writeFile(tmpFile, updateQuery + auditQuery);

  let wranglerCommand = `npx wrangler d1 execute DB --file=${tmpFile}`;
  if (envChoice === "local") {
    wranglerCommand += " --local --env staging";
  } else if (envChoice === "staging") {
    wranglerCommand += " --remote --env staging";
  } else if (envChoice === "production") {
    wranglerCommand += " --remote";
  }

  try {
    console.log(`Executing query against ${envChoice} database...`);
    execSync(wranglerCommand, { stdio: "inherit" });
    console.log("Password reset successful. All existing sessions revoked. Audit log created.");
  } catch (error) {
    console.error("Failed to execute password reset in database.");
  } finally {
    // clean up temp file
    await fs.unlink(tmpFile).catch(() => {});
  }
}

run();
