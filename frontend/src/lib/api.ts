import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363";

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
  | { ok: false; status: number; error?: string; details?: any };

async function call<T>(path: string, opts?: { method?: string; data?: any }) {
  try {
    const res = await instance.request<T>({
      url: path,
      method: opts?.method || "get",
      data: opts?.data,
    });
    return { ok: true, data: res.data } as ApiResult<T>;
  } catch (err: any) {
    const status = err.response?.status || 500;
    const body = err.response?.data;
    const message =
      typeof body === "string"
        ? body
        : body?.detail || body?.error || JSON.stringify(body || err.message);
    // If unauthorized, try to refresh once and replay the request
    if (status === 401) {
      const refresh = getRefreshToken();
      if (refresh) {
        const r = await refreshAuth(refresh);
        if (r.ok) {
          // retry original request once
          try {
            const retried = await instance.request<T>({
              url: path,
              method: opts?.method || "get",
              data: opts?.data,
            });
            return { ok: true, data: retried.data } as ApiResult<T>;
          } catch (err2: any) {
            const s2 = err2.response?.status || 500;
            const b2 = err2.response?.data;
            const m2 =
              typeof b2 === "string"
                ? b2
                : b2?.detail || b2?.error || JSON.stringify(b2 || err2.message);
            return { ok: false, status: s2, error: m2, details: b2 };
          }
        }
      }
    }

    return { ok: false, status, error: message, details: body };
  }
}

export async function authLogin(username: string, password: string) {
  const res = await call<{ access_token: string }>("/api/auth/login", {
    method: "post",
    data: { username, password },
  });
  if (res.ok) {
    const data = (res as any).data;
    const access = data?.access_token;
    const refresh = data?.refresh_token;
    try {
      localStorage.setItem("apujo_token", access);
      setAuthToken(access);
      setRefreshToken(refresh);
    } catch {}
  }
  return res;
}

export async function refreshAuth(refreshToken: string) {
  try {
    const res = await instance.post("/api/auth/refresh", {
      refresh_token: refreshToken,
    });
    const data = res.data as any;
    if (data?.access_token && data?.refresh_token) {
      try {
        localStorage.setItem("apujo_token", data.access_token);
        setAuthToken(data.access_token);
        setRefreshToken(data.refresh_token);
      } catch {}
      return { ok: true, data } as ApiResult<any>;
    }
    return {
      ok: false,
      status: 500,
      error: "Invalid refresh response",
      details: data,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: err.response?.status || 500,
      error: err.message,
      details: err.response?.data,
    };
  }
}

export function authLogout() {
  try {
    localStorage.removeItem("apujo_token");
    localStorage.removeItem("apujo_refresh");
  } catch {}
  setAuthToken(undefined);
}

export async function listThoughts(skip = 0, limit = 10) {
  return call(`/api/thoughts/?skip=${skip}&limit=${limit}`);
}

export async function getThought(slug: string) {
  return call(`/api/thoughts/${encodeURIComponent(slug)}`);
}

export async function createThought(payload: any) {
  return call(`/api/thoughts/`, { method: "post", data: payload });
}

export async function uploadImage(file: File) {
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await instance.request({
      url: "/api/uploads/",
      method: "post",
      data: form,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { ok: true, data: res.data } as ApiResult<any>;
  } catch (err: any) {
    return {
      ok: false,
      status: err.response?.status || 500,
      error: err.message,
      details: err.response?.data,
    } as ApiResult<any>;
  }
}

export async function uploadImageWithCategory(
  file: File,
  category: string = "thoughts"
) {
  try {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    const res = await instance.request({
      url: "/api/uploads/",
      method: "post",
      data: form,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { ok: true, data: res.data } as ApiResult<any>;
  } catch (err: any) {
    return {
      ok: false,
      status: err.response?.status || 500,
      error: err.message,
      details: err.response?.data,
    } as ApiResult<any>;
  }
}

export async function updateThought(slug: string, payload: any) {
  return call(`/api/thoughts/${encodeURIComponent(slug)}`, {
    method: "put",
    data: payload,
  });
}

export async function deleteThought(slug: string) {
  return call(`/api/thoughts/${encodeURIComponent(slug)}`, {
    method: "delete",
  });
}

export async function listWorks(skip = 0, limit = 10) {
  return call(`/api/works/?skip=${skip}&limit=${limit}`);
}

export async function getWork(slug: string) {
  return call(`/api/works/${encodeURIComponent(slug)}`);
}

export async function createWork(payload: any) {
  return call(`/api/works/`, { method: "post", data: payload });
}

export async function updateWork(slug: string, payload: any) {
  return call(`/api/works/${encodeURIComponent(slug)}`, {
    method: "put",
    data: payload,
  });
}

export async function deleteWork(slug: string) {
  return call(`/api/works/${encodeURIComponent(slug)}`, { method: "delete" });
}

export default {
  authLogin,
  authLogout,
  refreshAuth,
  listThoughts,
  getThought,
  createThought,
  updateThought,
  deleteThought,
  uploadImage,
  listWorks,
  getWork,
  createWork,
  updateWork,
  deleteWork,
};
