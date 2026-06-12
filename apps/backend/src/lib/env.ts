import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  DATABASE_URL: z
    .string({
      required_error:
        "DATABASE_URL is missing. Please define it in your .env file.",
    })
    .min(1, "DATABASE_URL cannot be empty."),
  JWT_SECRET: z
    .string({
      required_error:
        "JWT_SECRET is missing. Please define it in your .env file.",
    })
    .min(1, "JWT_SECRET cannot be empty."),
  PORT: z
    .preprocess(
      (val) => (val ? Number(val) : 3001),
      z.number().int().positive("PORT must be a positive integer."),
    )
    .default(3001),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Environment validation failed:");
  for (const issue of parsed.error.issues) {
    console.error(
      `  - ${issue.message || `${issue.path.join(".")} is invalid`}`,
    );
  }
  console.error(
    "\nPlease configure the missing or invalid environment variables in your .env file to settle it up.\n",
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
