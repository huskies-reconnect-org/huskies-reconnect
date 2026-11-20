-- Preloaded Fall 2026 course list for the demo (no course search for Dec 5).
-- Reference data, so it lives in a migration and reaches the hosted project.
-- Safe to re-run: existing offerings are left alone.

insert into public.courses (code, title, term, section, ends_on) values
  ('CS5010', 'Programming Design Paradigm',               '2026FA', null, '2026-12-12'),
  ('CS5100', 'Foundations of Artificial Intelligence',    '2026FA', null, '2026-12-12'),
  ('CS5200', 'Database Management Systems',               '2026FA', null, '2026-12-12'),
  ('CS5800', 'Algorithms',                                '2026FA', null, '2026-12-12'),
  ('CS6120', 'Natural Language Processing',               '2026FA', null, '2026-12-12'),
  ('CS6220', 'Data Mining Techniques',                    '2026FA', null, '2026-12-12'),
  ('DS5110', 'Introduction to Data Management and Processing', '2026FA', null, '2026-12-12'),
  ('DS5220', 'Supervised Machine Learning and Learning Theory', '2026FA', null, '2026-12-12')
on conflict on constraint courses_offering_unique do nothing;
