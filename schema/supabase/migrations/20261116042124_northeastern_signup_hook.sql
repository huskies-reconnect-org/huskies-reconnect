-- "Before user created" auth hook: only @northeastern.edu addresses can sign up.
-- Supabase Auth calls this before inserting into auth.users. Returning {} allows
-- the signup; returning {"error": ...} rejects it with that status and message.
--
-- After pushing, enable it in the dashboard:
--   Authentication -> Hooks -> Before User Created -> Postgres function
--   -> public.hook_before_user_created

create function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  email text := lower(coalesce(event -> 'user' ->> 'email', ''));
begin
  if email like '%@northeastern.edu' then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Huskies Reconnect is only open to @northeastern.edu email addresses.'
    )
  );
end;
$$;

-- Only Supabase Auth may call the hook.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_before_user_created(jsonb) from public, anon, authenticated;
