import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      name: string;
    };
    return decoded;
  } catch (err) {
    return null;
  }
}


