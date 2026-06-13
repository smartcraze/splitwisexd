"use client";

import type React from "react";
import { SocketProvider } from "@/lib/socket";
import { AuthProvider, useAuth } from "./auth/auth-context";

function SocketContainer({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return <SocketProvider token={token}>{children}</SocketProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SocketContainer>{children}</SocketContainer>
    </AuthProvider>
  );
}
