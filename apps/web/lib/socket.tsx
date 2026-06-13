"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { type Socket, io as socketIO } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string | null;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const newSocket = socketIO(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      setConnected(true);
      console.log("Socket.io connected");
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      console.log("Socket.io disconnected");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: socket state updates should not re-run connection setup
  }, [token]);


  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
