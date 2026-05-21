import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  isAuthenticated: boolean;
  email: string | null;
  name: string | null;
  setToken: (token: string, email: string, name?: string | null) => void;
  setName: (name: string | null) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  isAuthenticated: false,
  email: null,
  name: null,

  setToken: (token: string, email: string, name: string | null = null) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    localStorage.removeItem('export_token');
    localStorage.removeItem('export_token_expires');
    localStorage.removeItem('export_token_email');
    if (name) {
      localStorage.setItem('name', name);
    } else {
      localStorage.removeItem('name');
    }
    set({ token, email, name, isAuthenticated: true });
  },

  setName: (name: string | null) => {
    if (name) {
      localStorage.setItem('name', name);
    } else {
      localStorage.removeItem('name');
    }
    set({ name });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    localStorage.removeItem('export_token');
    localStorage.removeItem('export_token_expires');
    localStorage.removeItem('export_token_email');
    set({ token: null, email: null, name: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  initAuth: () => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    if (token && email) {
      set({ token, email, name, isAuthenticated: true });
    }
  },
}));
