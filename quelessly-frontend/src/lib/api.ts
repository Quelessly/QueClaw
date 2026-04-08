const BASE = process.env.NEXT_PUBLIC_API_URL

export const api = {
  get: (path: string, token?: string) =>
    fetch(`${BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((r) => r.json()),

  post: (path: string, body: unknown, token?: string) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  patch: (path: string, body: unknown, token?: string) =>
    fetch(`${BASE}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
}