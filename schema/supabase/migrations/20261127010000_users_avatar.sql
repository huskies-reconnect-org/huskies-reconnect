-- Avatar look chosen on the profile page; classmates see it on match cards.
-- Both optional: without a color the UI derives one from the user id; without a badge none is shown.
alter table public.users
  add column avatar_color text
    check (avatar_color in ('blush', 'sky', 'peach', 'mint', 'lavender', 'butter', 'teal', 'stone')),
  add column avatar_badge text
    check (char_length(avatar_badge) between 1 and 100);
