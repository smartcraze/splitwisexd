"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

const DEMO_USERS = [
  {
    name: "Aisha",
    email: "aisha@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha",
  },
  {
    name: "Rohan",
    email: "rohan@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
  },
  {
    name: "Priya",
    email: "priya@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
  },
  {
    name: "Meera",
    email: "meera@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera",
  },
  {
    name: "Sam",
    email: "sam@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
  },
  {
    name: "Dev",
    email: "dev@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev",
  },
];

export function LoginForm() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (user: (typeof DEMO_USERS)[0]) => {
    setLoading(true);
    const defaultPassword = "password123";
    try {
      await login(user.email, defaultPassword);
      toast.success(`Logged in as ${user.name}`);
      router.push("/dashboard");
    } catch (err: any) {
      try {
        await register(user.name, user.email, defaultPassword, user.avatarUrl);
        toast.success(`Created and logged in as ${user.name}`);
        router.push("/dashboard");
      } catch (regErr: any) {
        toast.error(regErr.message || "Demo login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-card border-border shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
          Sign In
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter credentials or click a profile to authenticate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer mt-2"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Quick Demo Login
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {DEMO_USERS.map((u) => (
            <Button
              key={u.email}
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin(u)}
              disabled={loading}
              className="text-xs h-9 cursor-pointer hover:bg-muted border-border font-medium"
            >
              {u.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
