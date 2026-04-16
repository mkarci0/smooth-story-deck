create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null default '',
  category text not null default '',
  year text not null default '',
  cover_url text,
  accent text not null default 'oklch(0.92 0.06 45)',
  role text not null default '',
  timeline text not null default '',
  team text not null default '',
  tools text[] not null default '{}',
  overview text not null default '',
  problem text not null default '',
  solution text not null default '',
  outcome jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  gallery text[] not null default '{}',
  position int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Anyone can view published projects"
  on public.projects for select
  to anon, authenticated
  using (published = true);

create policy "Admins can view all projects"
  on public.projects for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert projects"
  on public.projects for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update projects"
  on public.projects for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete projects"
  on public.projects for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true);

create policy "Public can view project images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-images');

create policy "Admins can upload project images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and public.has_role(auth.uid(), 'admin')
  );

create policy "Admins can update project images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-images'
    and public.has_role(auth.uid(), 'admin')
  );

create policy "Admins can delete project images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-images'
    and public.has_role(auth.uid(), 'admin')
  );