-- Profile fields used for matching, plus the profile embedding.
-- Embedding: Gemini (model in embedding_model), 768 dims, L2-normalized,
-- compared with cosine distance. Written by the API only.

alter table public.users
  add column interests       text check (char_length(interests) <= 500),
  add column goals           text check (char_length(goals) <= 500),
  add column embedding       extensions.vector(768),
  add column embedding_model text,
  add column embedded_at     timestamptz;

alter table public.users
  add constraint users_major_length check (char_length(major) <= 100),
  add constraint users_full_name_length check (char_length(full_name) <= 100);

-- No vector index yet: a few hundred profiles is an exact scan in well under a
-- millisecond, and exact search avoids approximate-index recall surprises.
-- Add HNSW (vector_cosine_ops) if this ever holds thousands of profiles.
