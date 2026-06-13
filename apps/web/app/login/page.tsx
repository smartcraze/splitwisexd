"use client";

import { LoginForm } from "@/components/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-muted/30">
      <div className="w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
