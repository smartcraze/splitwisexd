"use client";

import Link from "next/link";
import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      <div className="absolute top-[10%] left-[20%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[10%] right-[20%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />

      <div className="z-10 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-extrabold text-xl shadow-lg">
            W
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            SplitwiseXD
          </h2>
          <p className="text-sm text-muted-foreground">
            Accurate Shared Debt Ledgers
          </p>
        </div>

        <LoginForm />

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
