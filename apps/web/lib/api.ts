const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data: ApiResponseData<T>;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`Failed to parse response: ${response.statusText}`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data.data;
}
