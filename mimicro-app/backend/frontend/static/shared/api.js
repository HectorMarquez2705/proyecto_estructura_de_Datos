/* shared/api.js — Cliente HTTP centralizado */

window.Api = {
  async request(method, url, body = null, requiresAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (requiresAuth) {
      const token = Auth.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const opts = { method, headers };
    if (body !== null) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(url, opts);
      if (res.status === 401) {
        Auth.logout();
        return null;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw { status: res.status, detail: err.detail || JSON.stringify(err) };
      }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (e) {
      if (e.status) throw e;                // re-throw errores HTTP conocidos
      throw { status: 0, detail: 'Sin conexión con el servidor' };
    }
  },

  get(url, auth = true)         { return this.request('GET',    url, null, auth); },
  post(url, body, auth = true)  { return this.request('POST',   url, body, auth); },
  patch(url, body, auth = true) { return this.request('PATCH',  url, body, auth); },
  put(url, body, auth = true)   { return this.request('PUT',    url, body, auth); },
  del(url, auth = true)         { return this.request('DELETE', url, null, auth); },
};
