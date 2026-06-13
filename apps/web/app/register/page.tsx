"use client";

import React from "react";
import { RegisterForm } from "@/components/features/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-muted/30">
      <div className="w-full flex justify-center">
        <RegisterForm />
      </div>
    </div>
  );
}
