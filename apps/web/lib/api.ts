import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Fetch from the FastAPI backend with the current Supabase session's token. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {}
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

export type Course = {
  id: string;
  code: string;
  title: string;
  term: string;
  section: string | null;
  ends_on: string;
  member_count: number;
  joined: boolean;
};

export type Me = {
  id: string;
  email: string;
  full_name: string | null;
  major: string | null;
  grad_year: number | null;
  interests: string | null;
  goals: string | null;
  profile_complete: boolean;
  matchable: boolean;
};

export type ProfileIn = {
  full_name: string;
  major: string;
  grad_year: number | null;
  interests: string;
  goals: string;
};

export type ProfileOut = Me & { embedding_status: "updated" | "unchanged" | "failed" };

export type Match = {
  user_id: string;
  full_name: string | null;
  major: string | null;
  grad_year: number | null;
  interests: string | null;
  goals: string | null;
  similarity: number;
};
