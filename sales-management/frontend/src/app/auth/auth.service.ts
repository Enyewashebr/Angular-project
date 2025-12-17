import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

type StoredUser = AuthUser & { password: string };

const USERS_KEY = 'sales_management_users_v1';
const SESSION_KEY = 'sales_management_session_v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadUsers(): StoredUser[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function loadSession(): AuthUser | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function saveSession(user: AuthUser | null): void {
  if (!isBrowser()) return;
  try {
    if (!user) window.localStorage.removeItem(SESSION_KEY);
    else window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$ = new BehaviorSubject<AuthUser | null>(loadSession());

  currentUser(): Observable<AuthUser | null> {
    return this.user$.asObservable();
  }

  getCurrent(): AuthUser | null {
    return this.user$.getValue();
  }

  signup(input: { name: string; email: string; password: string }): void {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!name) throw new Error('Name is required.');
    if (!email) throw new Error('Email is required.');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');

    const users = loadUsers();
    if (users.some(u => u.email.toLowerCase() === email)) {
      throw new Error('Email already exists.');
    }

    const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const user: StoredUser = { id: nextId, name, email, password };
    saveUsers([...users, user]);

    // auto-login after signup
    const sessionUser: AuthUser = { id: user.id, name: user.name, email: user.email };
    this.user$.next(sessionUser);
    saveSession(sessionUser);
  }

  login(input: { email: string; password: string }): void {
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    const users = loadUsers();
    const match = users.find(u => u.email.toLowerCase() === email && u.password === password);
    if (!match) throw new Error('Invalid email or password.');

    const sessionUser: AuthUser = { id: match.id, name: match.name, email: match.email };
    this.user$.next(sessionUser);
    saveSession(sessionUser);
  }

  logout(): void {
    this.user$.next(null);
    saveSession(null);
  }
}


