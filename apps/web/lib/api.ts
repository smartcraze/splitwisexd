const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers, ...rest } = options;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryStr = searchParams.toString();
    if (queryStr) {
      url += `?${queryStr}`;
    }
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    headers: { ...defaultHeaders, ...headers },
    ...rest,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || "Something went wrong", response.status);
  }

  return data.data as T;
}

export const api = {
  // Auth
  login: (body: any) =>
    request<any>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body: any) =>
    request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getMe: () => request<any>("/auth/me", { method: "GET" }),

  // Groups
  getGroups: () => request<any[]>("/groups", { method: "GET" }),
  getGroupById: (id: string) =>
    request<any>(`/groups/${id}`, { method: "GET" }),
  createGroup: (body: any) =>
    request<any>("/groups", { method: "POST", body: JSON.stringify(body) }),
  addMember: (id: string, body: any) =>
    request<any>(`/groups/${id}/members`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  removeMember: (groupId: string, userId: string) =>
    request<any>(`/groups/${groupId}/members/${userId}`, { method: "DELETE" }),
  getBalances: (id: string) =>
    request<any>(`/groups/${id}/balances`, { method: "GET" }),
  getUserSummary: () => request<any>("/groups/summary", { method: "GET" }),

  // Expenses
  getExpenses: (groupId: string) =>
    request<any[]>("/expenses", { method: "GET", params: { groupId } }),
  getExpenseById: (id: string) =>
    request<any>(`/expenses/${id}`, { method: "GET" }),
  createExpense: (body: any) =>
    request<any>("/expenses", { method: "POST", body: JSON.stringify(body) }),
  updateExpense: (id: string, body: any) =>
    request<any>(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteExpense: (id: string) =>
    request<any>(`/expenses/${id}`, { method: "DELETE" }),

  // Settlements
  getSettlements: (groupId: string) =>
    request<any[]>("/settlements", { method: "GET", params: { groupId } }),
  createSettlement: (body: any) =>
    request<any>("/settlements", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Comments
  getComments: (expenseId: string) =>
    request<any[]>("/comments", { method: "GET", params: { expenseId } }),
  createComment: (body: any) =>
    request<any>("/comments", { method: "POST", body: JSON.stringify(body) }),
};
