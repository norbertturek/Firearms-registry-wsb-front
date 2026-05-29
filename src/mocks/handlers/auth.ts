import { http, HttpResponse } from 'msw';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const USERS: Record<string, { id: string; email: string; password: string; role: string }> = {
  'citizen@example.com': { id: 'u-citizen-001', email: 'citizen@example.com', password: 'Citizen123!', role: 'Citizen' },
  'joanna.dymna@example.com': { id: 'u-joanna-001', email: 'joanna.dymna@example.com', password: 'Citizen123!', role: 'Citizen' },
  'officer@example.com': { id: 'u-officer-001', email: 'officer@example.com', password: 'Officer123!', role: 'WpaOfficer' },
  'shop@example.com':    { id: 'u-shop-001',    email: 'shop@example.com',    password: 'Shop123!',    role: 'Shop' },
  'admin@example.com':   { id: 'u-admin-001',   email: 'admin@example.com',   password: 'Admin123!',   role: 'Admin' },
};

const TOKEN_USER: Record<string, string> = Object.fromEntries(
  Object.values(USERS).map((u) => [`mock-token-${u.id}`, u.email]),
);

export const authHandlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string };
    const user = USERS[email?.toLowerCase()];
    if (!user || user.password !== password) {
      return HttpResponse.json({ message: 'Nieprawidłowy email lub hasło' }, { status: 401 });
    }
    return HttpResponse.json({
      token: `mock-token-${user.id}`,
      expiresAt: new Date(Date.now() + 24 * 3_600_000).toISOString(),
      user: { id: user.id, email: user.email, role: user.role, isActive: true },
    });
  }),

  http.get(`${BASE}/auth/me`, ({ request }) => {
    const auth = request.headers.get('Authorization') ?? '';
    const token = auth.replace('Bearer ', '');
    const email = TOKEN_USER[token];
    const user = email ? USERS[email] : null;
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json({ id: user.id, email: user.email, role: user.role, isActive: true });
  }),
];
