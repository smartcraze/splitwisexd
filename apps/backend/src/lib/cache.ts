export async function invalidateCache(tags: string[]) {
  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${url}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    if (!res.ok) {
      console.error("Cache invalidation response not ok:", res.statusText);
    }
  } catch (err) {
    console.error("Failed to invalidate cache tags:", tags, err);
  }
}
