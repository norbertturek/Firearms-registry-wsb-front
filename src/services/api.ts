const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  const combined = `${base}${suffix}`;
  if (combined.startsWith('http://') || combined.startsWith('https://')) {
    return combined;
  }
  return new URL(combined, window.location.origin).toString();
}

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

// ============================================================================
// TOKEN HELPERS
// ============================================================================

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!token || !expiry) return null;
  if (new Date(expiry) < new Date()) {
    clearAuth();
    return null;
  }
  return token;
}

export function setToken(token: string, expiresAt: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem('userRole');
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// ============================================================================
// FETCH WRAPPER
// ============================================================================

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),

  };
}

function authHeadersWithoutContentType(): HeadersInit {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    if (err instanceof TypeError) {
      throw {
        message:
          "Brak połączenia z API (load failed). Na telefonie użyj pnpm dev:mobile z mockami lub backendu w LAN — adres localhost z telefonu nie działa.",
        networkError: true,
        cause: err.message,
      };
    }
    throw err;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    clearAuth();
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    throw { message: 'Sesja wygasła. Zaloguj się ponownie.' };
  }

  if (!res.ok) {
    let errorBody: any = {};
    try {
      errorBody = await res.json();
    } catch {
      errorBody = { message: `Błąd ${res.status}` };
    }
    throw errorBody;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

const api = {
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(apiUrl(path));
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }
    const res = await request(url.toString(), { headers: authHeaders() });
    return handleResponse<T>(res);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await request(apiUrl(path), {
      method: 'POST',
      headers: authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async postForm<T>(path: string, formData: FormData): Promise<T> {
    const res = await request(apiUrl(path), {
      method: 'POST',
      headers: authHeadersWithoutContentType(),
      body: formData,
    });
    return handleResponse<T>(res);
  },

  async getBlob(path: string): Promise<Blob> {
    const res = await request(apiUrl(path), {
      headers: authHeadersWithoutContentType(),
    });
    if (!res.ok) await handleResponse<never>(res);
    return res.blob();
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await request(apiUrl(path), {
      method: 'PATCH',
      headers: authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await request(apiUrl(path), {
      method: 'PUT',
      headers: authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async delete<T>(path: string): Promise<T> {
    const res = await request(apiUrl(path), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<T>(res);
  },
};

export default api;
