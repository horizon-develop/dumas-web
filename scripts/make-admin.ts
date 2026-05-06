import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

const email = process.argv[2];
if (!email) {
  console.error("Usage: bun scripts/make-admin.ts <email>");
  process.exit(1);
}

const result = await db
  .update(users)
  .set({ role: "ADMIN", status: "ACTIVE" })
  .where(eq(users.email, email.toLowerCase().trim()))
  .returning();

if (result.length === 0) {
  console.error(`No user found with email: ${email}`);
  process.exit(1);
}

console.log(`✓ ${result[0].email} is now ADMIN`);
process.exit(0);
