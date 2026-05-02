insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'ana@vicina.local',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Ana"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'marco@vicina.local',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Marco"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-4333-8333-333333333333',
    'authenticated',
    'authenticated',
    'jules@vicina.local',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Jules"}',
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.profiles (id, display_name, bio)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Ana',
    'Coffee, walks, and low-pressure local plans.'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Marco',
    'Usually around downtown with a board game in my bag.'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Jules',
    'Study sessions and outdoor breaks.'
  )
on conflict (id) do update
set display_name = excluded.display_name,
    bio = excluded.bio;

insert into public.signals (
  id,
  author_id,
  title,
  description,
  category,
  approximate_location_label,
  latitude,
  longitude,
  starts_at,
  expires_at,
  visibility_radius_miles
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'Coffee and a quick reset',
    'Heading to grab coffee. Open to a short chat or co-working hour.',
    'food-coffee',
    'near Downtown',
    36.10,
    -80.24,
    now() - interval '20 minutes',
    now() + interval '4 hours',
    3
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'Casual board games tonight',
    'Bringing a few lightweight games. Drop in if you want a table.',
    'games',
    'near the Innovation Quarter',
    36.10,
    -80.25,
    now() + interval '45 minutes',
    now() + interval '5 hours',
    5
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    '33333333-3333-4333-8333-333333333333',
    'Walk before the next work block',
    'Planning a relaxed loop outside. Good for a screen break.',
    'outdoors',
    'near Bailey Park',
    36.10,
    -80.24,
    now() + interval '20 minutes',
    now() + interval '2 hours',
    1
  )
on conflict (id) do update
set expires_at = excluded.expires_at,
    starts_at = excluded.starts_at,
    status = 'active',
    content_status = 'visible';

insert into public.signal_interests (signal_id, user_id)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '11111111-1111-4111-8111-111111111111')
on conflict (signal_id, user_id) do nothing;

insert into public.signal_comments (signal_id, author_id, body)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '22222222-2222-4222-8222-222222222222',
  'I can swing by for 20 minutes.'
)
on conflict do nothing;
