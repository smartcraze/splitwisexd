"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "./auth-context";

export function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isNameValid = name.length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password requirements
  const hasMinLength = password.length >= 10;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLowercase && hasUppercase && hasNumber && hasSpecial;

  const isFormValid = isNameValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { label: "10+ characters", met: hasMinLength },
    { label: "Lowercase letter", met: hasLowercase },
    { label: "Uppercase letter", met: hasUppercase },
    { label: "Number (0-9)", met: hasNumber },
    { label: "Special symbol", met: hasSpecial },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-2xl backdrop-blur-md"
    >
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to register a new account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            className={`w-full bg-background border-border text-foreground focus:ring-ring focus:border-primary ${
              !isNameValid && name !== "" ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
            }`}
          />
          {!isNameValid && name !== "" && (
            <p className="text-[10px] text-destructive font-medium">Name must be at least 2 characters long</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className={`w-full bg-background border-border text-foreground focus:ring-ring focus:border-primary ${
              !isEmailValid && email !== "" ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
            }`}
          />
          {!isEmailValid && email !== "" && (
            <p className="text-[10px] text-destructive font-medium">Please enter a valid email address</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className={`w-full bg-background border-border text-foreground focus:ring-ring focus:border-primary ${
              !isPasswordValid && password !== "" ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
            }`}
          />
          {password !== "" && (
            <div className="grid grid-cols-2 gap-1.5 pt-1.5">
              {requirements.map((req) => (
                <div key={req.label} className="flex items-center gap-1.5 text-[10px] font-semibold transition-all">
                  <span className={`h-1.5 w-1.5 rounded-full ${req.met ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                  <span className={req.met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md font-semibold"
          disabled={loading || !isFormValid}
        >
          {loading ? "Registering..." : "Sign Up"}
        </Button>
      </form>


      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}
