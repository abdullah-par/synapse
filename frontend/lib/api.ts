const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== "undefined" ? "" : "http://localhost:8000");

export default API_BASE;
