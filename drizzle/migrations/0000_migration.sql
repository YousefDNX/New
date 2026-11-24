
-- ROLES
create type public.app_role as enum ('admin','moderator','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  date_of_birth date,
  age_band text,
  region text not null default 'global',
  country text,
  language text not null default 'en',
  grade text,
  school text,
  goals text[] not null default '{}',
  interests text[] not null default '{}',
  parental_consent boolean not null default false,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

-- Age validation: 13+, compute band
create or replace function public.validate_profile()
returns trigger language plpgsql set search_path = public as $$
declare age int;
begin
  if new.date_of_birth is not null then
    age := date_part('year', age(current_date, new.date_of_birth));
    if age < 13 then raise exception 'NEXORA is for students aged 13 and over'; end if;
    if age > 100 then raise exception 'Invalid date of birth'; end if;
    new.age_band := case when age < 16 then '13-15' when age < 18 then '16-17' else '18+' end;
  end if;
  if new.language not in ('en','ar') then new.language := 'en'; end if;
  if new.onboarded and new.date_of_birth is null then raise exception 'Date of birth required'; end if;
  new.updated_at := now();
  return new;
end $$;
create trigger profiles_validate before insert or update on public.profiles for each row execute function public.validate_profile();

-- SETTINGS
create table public.user_settings (
  user_id uuid primary key,
  theme text not null default 'dark',
  font_scale numeric not null default 1,
  dyslexia_font boolean not null default false,
  high_contrast boolean not null default false,
  reduced_motion boolean not null default false,
  ai_share_profile boolean not null default true,
  ai_share_tasks boolean not null default true,
  ai_share_growth boolean not null default true,
  notify_reminders boolean not null default true,
  notify_community boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.user_settings to authenticated;
grant all on public.user_settings to service_role;
alter table public.user_settings enable row level security;
create policy "own settings" on public.user_settings for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- GROWTH ENGINE
create table public.xp_rules (
  event_type text primary key,
  area text not null,
  xp int not null,
  daily_cap int not null default 20,
  label text not null
);
grant select on public.xp_rules to authenticated;
grant all on public.xp_rules to service_role;
alter table public.xp_rules enable row level security;
create policy "rules readable" on public.xp_rules for select to authenticated using (true);

insert into public.xp_rules(event_type, area, xp, daily_cap, label) values
 ('task_completed','productivity',10,20,'Completed a task'),
 ('focus_session','productivity',15,8,'Finished a focus session'),
 ('note_created','academic',5,10,'Created a study note'),
 ('mistake_logged','academic',4,15,'Logged a mistake to learn from'),
 ('mistake_resolved','academic',12,15,'Mastered a past mistake'),
 ('goal_completed','growth',40,5,'Achieved a goal'),
 ('onboarding_completed','growth',50,1,'Set up your Growth Map');

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  event_type text not null references public.xp_rules(event_type),
  area text not null,
  xp int not null,
  ref_id uuid,
  created_at timestamptz not null default now()
);
create index on public.activity_events(user_id, created_at desc);
grant select on public.activity_events to authenticated;
grant all on public.activity_events to service_role;
alter table public.activity_events enable row level security;
create policy "own events" on public.activity_events for select to authenticated using (auth.uid() = user_id);

create table public.user_stats (
  user_id uuid primary key,
  xp int not null default 0,
  level int not null default 1,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date
);
grant select on public.user_stats to authenticated;
grant all on public.user_stats to service_role;
alter table public.user_stats enable row level security;
create policy "own stats" on public.user_stats for select to authenticated using (auth.uid() = user_id);

create or replace function public.level_for_xp(_xp int) returns int language sql immutable as $$ select floor(sqrt(greatest(_xp,0) / 50.0))::int + 1 $$;

-- internal: only called from triggers (not granted to clients)
create or replace function public.record_activity(_user uuid, _type text, _ref uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.xp_rules; cnt int; today date := (now() at time zone 'utc')::date; s public.user_stats;
begin
  select * into r from public.xp_rules where event_type = _type;
  if not found then return; end if;
  if _ref is not null and exists (select 1 from public.activity_events where user_id=_user and event_type=_type and ref_id=_ref) then return; end if;
  select count(*) into cnt from public.activity_events where user_id=_user and event_type=_type and created_at >= today;
  if cnt >= r.daily_cap then return; end if;
  insert into public.activity_events(user_id,event_type,area,xp,ref_id) values (_user,_type,r.area,r.xp,_ref);
  insert into public.user_stats(user_id) values (_user) on conflict do nothing;
  select * into s from public.user_stats where user_id=_user for update;
  update public.user_stats set
    xp = s.xp + r.xp,
    level = public.level_for_xp(s.xp + r.xp),
    current_streak = case when s.last_active_date = today then s.current_streak when s.last_active_date = today - 1 then s.current_streak + 1 else 1 end,
    longest_streak = greatest(s.longest_streak, case when s.last_active_date = today then s.current_streak when s.last_active_date = today - 1 then s.current_streak + 1 else 1 end),
    last_active_date = today
  where user_id=_user;
end $$;
revoke all on function public.record_activity(uuid,text,uuid) from public, anon, authenticated;

-- GOALS
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null check (char_length(title) between 1 and 200),
  area text not null default 'academic',
  status text not null default 'active' check (status in ('active','completed','archived')),
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.goals to authenticated;
grant all on public.goals to service_role;
alter table public.goals enable row level security;
create policy "own goals" on public.goals for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- TASKS
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null check (char_length(title) between 1 and 300),
  details text,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  status text not null default 'todo' check (status in ('todo','done')),
  due_at timestamptz,
  goal_id uuid references public.goals(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.tasks(user_id, status, due_at);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;
create policy "own tasks" on public.tasks for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  minutes int not null check (minutes between 1 and 180),
  task_id uuid references public.tasks(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz not null default now()
);
grant select, insert, delete on public.focus_sessions to authenticated;
grant all on public.focus_sessions to service_role;
alter table public.focus_sessions enable row level security;
create policy "own focus" on public.focus_sessions for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- STUDY
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.subjects to authenticated;
grant all on public.subjects to service_role;
alter table public.subjects enable row level security;
create policy "own subjects" on public.subjects for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notes to authenticated;
grant all on public.notes to service_role;
alter table public.notes enable row level security;
create policy "own notes" on public.notes for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

create table public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subject_id uuid references public.subjects(id) on delete set null,
  topic text not null check (char_length(topic) between 1 and 120),
  question text,
  my_answer text,
  correct_answer text,
  error_type text not null default 'concept' check (error_type in ('concept','careless','memory','time','misread')),
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.mistakes to authenticated;
grant all on public.mistakes to service_role;
alter table public.mistakes enable row level security;
create policy "own mistakes" on public.mistakes for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- EVENT TRIGGERS (Growth Map wiring)
create or replace function public.tg_growth() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'tasks' then
    if new.status = 'done' and (tg_op = 'INSERT' or old.status <> 'done') then
      new.completed_at := coalesce(new.completed_at, now());
      perform public.record_activity(new.user_id,'task_completed',new.id);
    elsif new.status <> 'done' then new.completed_at := null; end if;
  elsif tg_table_name = 'focus_sessions' then
    if new.minutes >= 10 then perform public.record_activity(new.user_id,'focus_session',new.id); end if;
  elsif tg_table_name = 'notes' then
    if tg_op='INSERT' then perform public.record_activity(new.user_id,'note_created',new.id); end if;
    new.updated_at := now();
  elsif tg_table_name = 'mistakes' then
    if tg_op='INSERT' then perform public.record_activity(new.user_id,'mistake_logged',new.id); end if;
    if new.resolved and (tg_op='INSERT' or not old.resolved) then new.resolved_at := now(); perform public.record_activity(new.user_id,'mistake_resolved',new.id); end if;
  elsif tg_table_name = 'goals' then
    if new.status='completed' and (tg_op='INSERT' or old.status<>'completed') then new.completed_at := now(); perform public.record_activity(new.user_id,'goal_completed',new.id); end if;
  elsif tg_table_name = 'profiles' then
    if new.onboarded and (tg_op='INSERT' or not old.onboarded) then perform public.record_activity(new.id,'onboarding_completed',null); end if;
  end if;
  return new;
end $$;
create trigger tasks_growth before insert or update on public.tasks for each row execute function public.tg_growth();
create trigger focus_growth before insert on public.focus_sessions for each row execute function public.tg_growth();
create trigger notes_growth before insert or update on public.notes for each row execute function public.tg_growth();
create trigger mistakes_growth before insert or update on public.mistakes for each row execute function public.tg_growth();
create trigger goals_growth before insert or update on public.goals for each row execute function public.tg_growth();
create trigger profiles_growth after update on public.profiles for each row execute function public.tg_growth();

-- NEW USER
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, display_name, avatar_url) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url');
  insert into public.user_settings(user_id) values (new.id);
  insert into public.user_stats(user_id) values (new.id);
  insert into public.user_roles(user_id, role) values (new.id, 'user');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
