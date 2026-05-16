import axios from "axios";

const RAW =
  (import.meta.env.VITE_API_BASE as string) || "http://localhost:6363";
const BASE = RAW.replace(/\/+$/, "");
export const API_BASE = BASE;

export function apiUrl(path: string) {
  return `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;
}

const instance = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

function setAuthToken(token?: string) {
  if (token)
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete instance.defaults.headers.common["Authorization"];
}

if (typeof window !== "undefined") {
  const t = localStorage.getItem("apujo_token");
  if (t) setAuthToken(t);
}

function setRefreshToken(token?: string) {
  try {
    if (token) localStorage.setItem("apujo_refresh", token);
    else localStorage.removeItem("apujo_refresh");
  } catch {}
}

function getRefreshToken(): string | null {
  try {
    return typeof window !== "undefined"
      ? localStorage.getItem("apujo_refresh")
      : null;
  } catch {
    return null;
  }
}

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error?: string; details?: unknown };

export async function call<T>(
  path: string,
  opts?: { method?: string; data?: unknown },
): Promise<ApiResult<T>> {
  try {
    const res = await instance.request<T>({
      url: path,
      method: opts?.method || "get",
      data: opts?.data,
    });
    return { ok: true, data: res.data };
  } catch (err: unknown) {
    const axiosErr = err as {
      response?: { status: number; data: unknown };
      message?: string;
    };
    const status = axiosErr.response?.status || 500;
    const body = axiosErr.response?.data;
    const message =
      typeof body === "string"
        ? body
        : (body as { detail?: string; error?: string })?.detail ||
          (body as { error?: string })?.error ||
          JSON.stringify(body || axiosErr.message);

    if (status === 401) {
      const refresh = getRefreshToken();
      if (refresh) {
        const r = await refreshAuth(refresh);
        if (r.ok) {
          try {
            const retried = await instance.request<T>({
              url: path,
              method: opts?.method || "get",
              data: opts?.data,
            });
            return { ok: true, data: retried.data };
          } catch (err2: unknown) {
            const e2 = err2 as { response?: { status: number; data: unknown } };
            return {
              ok: false,
              status: e2.response?.status || 500,
              error: JSON.stringify(e2.response?.data),
              details: e2.response?.data,
            };
          }
        }
      }
    }

    return { ok: false, status, error: message as string, details: body };
  }
}

export async function authLogin(username: string, password: string) {
  const res = await call<{ access_token: string; refresh_token?: string }>(
    "/api/auth/login",
    { method: "post", data: { username, password } },
  );
  if (res.ok) {
    const access = res.data?.access_token;
    const refresh = res.data?.refresh_token;
    if (access) {
      setAuthToken(access);
      localStorage.setItem("apujo_token", access);
    }
    if (refresh) setRefreshToken(refresh);
  }
  return res;
}

export async function refreshAuth(refreshToken: string) {
  try {
    const res = await axios.post<{ access_token: string }>(
      `${BASE}/api/auth/refresh`,
      { refresh_token: refreshToken },
    );
    const access = res.data?.access_token;
    if (access) {
      setAuthToken(access);
      localStorage.setItem("apujo_token", access);
    }
    return { ok: true as const, data: res.data };
  } catch {
    localStorage.removeItem("apujo_token");
    localStorage.removeItem("apujo_refresh");
    setAuthToken(undefined);
    return { ok: false as const, status: 401, error: "Refresh failed" };
  }
}

export function authLogout() {
  setAuthToken(undefined);
  setRefreshToken(undefined);
  localStorage.removeItem("apujo_token");
  localStorage.removeItem("apujo_refresh");
}

// ── Thoughts ──────────────────────────────────────────────────────────────
export const listThoughts = (skip = 0, limit = 10) =>
  call<unknown[]>(`/api/thoughts/?skip=${skip}&limit=${limit}`);

export const getThought = (slug: string) =>
  call<unknown>(`/api/thoughts/${slug}`);

export const createThought = (data: unknown) =>
  call<unknown>("/api/thoughts/", { method: "post", data });

export const updateThought = (slug: string, data: unknown) =>
  call<unknown>(`/api/thoughts/${slug}`, { method: "put", data });

export const deleteThought = (slug: string) =>
  call<unknown>(`/api/thoughts/${slug}`, { method: "delete" });

// ── Works ─────────────────────────────────────────────────────────────────
export const listWorks = (skip = 0, limit = 10) =>
  call<unknown[]>(`/api/works/?skip=${skip}&limit=${limit}`);

export const getWork = (slug: string) => call<unknown>(`/api/works/${slug}`);

export const createWork = (data: unknown) =>
  call<unknown>("/api/works/", { method: "post", data });

export const updateWork = (slug: string, data: unknown) =>
  call<unknown>(`/api/works/${slug}`, { method: "put", data });

export const deleteWork = (slug: string) =>
  call<unknown>(`/api/works/${slug}`, { method: "delete" });

// ── Analytics ─────────────────────────────────────────────────────────────
export const listAnalytic = (skip = 0, limit = 10) =>
  call<unknown[]>(`/api/analytics/?skip=${skip}&limit=${limit}`);

export const getAnalytic = (slug: string) =>
  call<unknown>(`/api/analytics/${slug}`);

export async function createAnalytic(fd: FormData) {
  try {
    const res = await instance.post<unknown>("/api/analytics/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { ok: true as const, data: res.data };
  } catch (err: unknown) {
    const e = err as { response?: { status: number; data: unknown } };
    return {
      ok: false as const,
      status: e.response?.status || 500,
      error: JSON.stringify(e.response?.data),
    };
  }
}

export async function updateAnalytic(slug: string, fd: FormData) {
  try {
    const res = await instance.put<unknown>(`/api/analytics/${slug}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { ok: true as const, data: res.data };
  } catch (err: unknown) {
    const e = err as { response?: { status: number; data: unknown } };
    return {
      ok: false as const,
      status: e.response?.status || 500,
      error: JSON.stringify(e.response?.data),
    };
  }
}

export const deleteAnalytic = (slug: string) =>
  call<unknown>(`/api/analytics/${slug}`, { method: "delete" });

// ── Image upload ──────────────────────────────────────────────────────────
export async function uploadImage(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await instance.post<{ url: string }>("/api/uploads/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { ok: true as const, data: res.data };
  } catch (err: unknown) {
    const e = err as { response?: { status: number; data: unknown } };
    return {
      ok: false as const,
      status: e.response?.status || 500,
      error: JSON.stringify(e.response?.data),
    };
  }
}

export async function uploadImageWithCategory(file: File, category: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("category", category);
  try {
    const res = await instance.post<{ url: string }>("/api/uploads/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { ok: true as const, data: res.data };
  } catch (err: unknown) {
    const e = err as { response?: { status: number; data: unknown } };
    return {
      ok: false as const,
      status: e.response?.status || 500,
      error: JSON.stringify(e.response?.data),
    };
  }
}
