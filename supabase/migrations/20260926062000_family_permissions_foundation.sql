-- Phase 1 platform foundation:
-- family households, adult-child relationships, scoped child permissions, and
-- compatibility helpers for the current students/weekly_lessons/student_progress app.

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Family',
  created_by uuid references auth.users(id) on delete set null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  adult_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, adult_id)
);

create table if not exists public.permission_definitions (
  name text primary key,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.relationship_permission_defaults (
  relationship text not null,
  permission text not null references public.permission_definitions(name) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (relationship, permission)
);

create table if not exists public.adult_child_relationships (
  id uuid primary key default gen_random_uuid(),
  adult_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  family_id uuid references public.families(id) on delete set null,
  relationship text not null,
  status text not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (adult_id, student_id, relationship)
);

create table if not exists public.child_permission_grants (
  id uuid primary key default gen_random_uuid(),
  adult_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  permission text not null references public.permission_definitions(name) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  source text not null default 'relationship_default',
  created_at timestamptz not null default now(),
  unique (adult_id, student_id, permission)
);

alter table public.families enable row level security;
alter table public.family_memberships enable row level security;
alter table public.adult_child_relationships enable row level security;
alter table public.child_permission_grants enable row level security;
alter table public.permission_definitions enable row level security;
alter table public.relationship_permission_defaults enable row level security;

create index if not exists family_memberships_adult_idx on public.family_memberships (adult_id);
create index if not exists adult_child_relationships_adult_idx on public.adult_child_relationships (adult_id);
create index if not exists adult_child_relationships_student_idx on public.adult_child_relationships (student_id);
create index if not exists child_permission_grants_adult_student_idx on public.child_permission_grants (adult_id, student_id);
create index if not exists child_permission_grants_student_permission_idx on public.child_permission_grants (student_id, permission);

drop trigger if exists families_touch on public.families;
create trigger families_touch before update on public.families
for each row execute function public.touch_updated_at();

drop trigger if exists family_memberships_touch on public.family_memberships;
create trigger family_memberships_touch before update on public.family_memberships
for each row execute function public.touch_updated_at();

drop trigger if exists adult_child_relationships_touch on public.adult_child_relationships;
create trigger adult_child_relationships_touch before update on public.adult_child_relationships
for each row execute function public.touch_updated_at();

insert into public.permission_definitions (name, description)
values
  ('view_child_profile', 'View the child profile and basic learner identity.'),
  ('manage_child_profile', 'Edit child profile settings and learner identity.'),
  ('view_child_progress', 'View progress, attempts, mastery, goals, and reports.'),
  ('view_reports', 'View generated progress reports and analytics.'),
  ('create_assignment', 'Create assignments or learning activities for the child.'),
  ('edit_assignment', 'Edit assignments the relationship is allowed to manage.'),
  ('approve_completion', 'Approve or review completion of learning work.'),
  ('manage_rewards', 'Grant or manage rewards and reward settings.'),
  ('manage_avatar', 'Manage avatar/cosmetic settings.'),
  ('invite_users', 'Invite adults into an allowed family or child context.'),
  ('manage_billing', 'Manage billing/subscription settings for the scope.'),
  ('delete_child', 'Delete or archive the child profile.')
on conflict (name) do nothing;

insert into public.relationship_permission_defaults (relationship, permission)
values
  ('parent', 'view_child_profile'),
  ('parent', 'manage_child_profile'),
  ('parent', 'view_child_progress'),
  ('parent', 'view_reports'),
  ('parent', 'create_assignment'),
  ('parent', 'edit_assignment'),
  ('parent', 'approve_completion'),
  ('parent', 'manage_rewards'),
  ('parent', 'manage_avatar'),
  ('parent', 'invite_users'),
  ('parent', 'manage_billing'),
  ('parent', 'delete_child'),
  ('guardian', 'view_child_profile'),
  ('guardian', 'manage_child_profile'),
  ('guardian', 'view_child_progress'),
  ('guardian', 'view_reports'),
  ('guardian', 'create_assignment'),
  ('guardian', 'edit_assignment'),
  ('guardian', 'approve_completion'),
  ('guardian', 'manage_rewards'),
  ('guardian', 'manage_avatar'),
  ('guardian', 'invite_users'),
  ('guardian', 'manage_billing'),
  ('guardian', 'delete_child'),
  ('homeschool_educator', 'view_child_profile'),
  ('homeschool_educator', 'view_child_progress'),
  ('homeschool_educator', 'view_reports'),
  ('homeschool_educator', 'create_assignment'),
  ('homeschool_educator', 'edit_assignment'),
  ('homeschool_educator', 'approve_completion'),
  ('homeschool_educator', 'manage_rewards'),
  ('homeschool_educator', 'manage_avatar'),
  ('caregiver', 'view_child_profile'),
  ('caregiver', 'view_child_progress'),
  ('caregiver', 'create_assignment'),
  ('caregiver', 'approve_completion'),
  ('grandparent', 'view_child_profile'),
  ('grandparent', 'view_child_progress'),
  ('grandparent', 'view_reports'),
  ('grandparent', 'manage_rewards'),
  ('viewer', 'view_child_profile'),
  ('viewer', 'view_child_progress'),
  ('tutor', 'view_child_profile'),
  ('tutor', 'view_child_progress'),
  ('tutor', 'create_assignment'),
  ('tutor', 'edit_assignment'),
  ('tutor', 'approve_completion')
on conflict (relationship, permission) do nothing;

create or replace function private.has_child_permission(sid uuid, perm text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.child_permission_grants g
    where g.student_id = sid
      and g.adult_id = auth.uid()
      and g.permission = perm
  )
  or exists (
    select 1
    from public.students s
    where s.id = sid
      and s.auth_user_id = auth.uid()
      and perm in ('view_child_profile', 'view_child_progress')
  );
$$;

create or replace function private.can_access_student(sid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select private.has_child_permission(sid, 'view_child_profile')
     or private.has_child_permission(sid, 'view_child_progress');
$$;

create or replace function private.owns_student(sid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select private.has_child_permission(sid, 'manage_child_profile')
     or exists (
       select 1
       from public.students s
       where s.id = sid
         and s.owner_id = auth.uid()
     );
$$;

grant execute on function private.has_child_permission(uuid, text) to anon, authenticated, service_role;
grant execute on function private.can_access_student(uuid) to anon, authenticated, service_role;
grant execute on function private.owns_student(uuid) to anon, authenticated, service_role;

drop policy if exists permission_definitions_read on public.permission_definitions;
create policy permission_definitions_read
on public.permission_definitions
for select
to authenticated
using (true);

drop policy if exists relationship_permission_defaults_read on public.relationship_permission_defaults;
create policy relationship_permission_defaults_read
on public.relationship_permission_defaults
for select
to authenticated
using (true);

drop policy if exists families_member_select on public.families;
create policy families_member_select
on public.families
for select
to authenticated
using (
  exists (
    select 1
    from public.family_memberships fm
    where fm.family_id = families.id
      and fm.adult_id = auth.uid()
      and fm.status = 'active'
  )
);

drop policy if exists families_creator_insert on public.families;
create policy families_creator_insert
on public.families
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists families_manager_update on public.families;
create policy families_manager_update
on public.families
for update
to authenticated
using (
  exists (
    select 1
    from public.family_memberships fm
    where fm.family_id = families.id
      and fm.adult_id = auth.uid()
      and fm.status = 'active'
      and fm.relationship in ('owner', 'admin', 'parent', 'guardian')
  )
)
with check (
  exists (
    select 1
    from public.family_memberships fm
    where fm.family_id = families.id
      and fm.adult_id = auth.uid()
      and fm.status = 'active'
      and fm.relationship in ('owner', 'admin', 'parent', 'guardian')
  )
);

drop policy if exists family_memberships_member_select on public.family_memberships;
create policy family_memberships_member_select
on public.family_memberships
for select
to authenticated
using (
  adult_id = auth.uid()
  or exists (
    select 1
    from public.family_memberships fm
    where fm.family_id = family_memberships.family_id
      and fm.adult_id = auth.uid()
      and fm.status = 'active'
      and fm.relationship in ('owner', 'admin', 'parent', 'guardian')
  )
);

drop policy if exists family_memberships_self_insert on public.family_memberships;
create policy family_memberships_self_insert
on public.family_memberships
for insert
to authenticated
with check (adult_id = auth.uid());

drop policy if exists adult_child_relationships_select on public.adult_child_relationships;
create policy adult_child_relationships_select
on public.adult_child_relationships
for select
to authenticated
using (
  adult_id = auth.uid()
  or private.has_child_permission(student_id, 'invite_users')
  or private.has_child_permission(student_id, 'manage_child_profile')
);

drop policy if exists adult_child_relationships_manage on public.adult_child_relationships;
create policy adult_child_relationships_manage
on public.adult_child_relationships
for all
to authenticated
using (
  adult_id = auth.uid()
  or private.has_child_permission(student_id, 'invite_users')
  or private.has_child_permission(student_id, 'manage_child_profile')
)
with check (
  adult_id = auth.uid()
  or private.has_child_permission(student_id, 'invite_users')
  or private.has_child_permission(student_id, 'manage_child_profile')
);

drop policy if exists child_permission_grants_select on public.child_permission_grants;
create policy child_permission_grants_select
on public.child_permission_grants
for select
to authenticated
using (
  adult_id = auth.uid()
  or private.has_child_permission(student_id, 'invite_users')
  or private.has_child_permission(student_id, 'manage_child_profile')
);

drop policy if exists child_permission_grants_manage on public.child_permission_grants;
create policy child_permission_grants_manage
on public.child_permission_grants
for all
to authenticated
using (
  private.has_child_permission(student_id, 'invite_users')
  or private.has_child_permission(student_id, 'manage_child_profile')
)
with check (
  private.has_child_permission(student_id, 'invite_users')
  or private.has_child_permission(student_id, 'manage_child_profile')
);

-- Backfill a family and parent relationship for existing owner-owned learners.
with owner_rows as (
  select distinct s.owner_id, coalesce(p.display_name, split_part(coalesce(p.email, ''), '@', 1), 'Family') as display_name
  from public.students s
  left join public.profiles p on p.id = s.owner_id
),
created_families as (
  insert into public.families (name, created_by)
  select display_name || ' Family', owner_id
  from owner_rows
  where owner_id is not null
    and not exists (
      select 1 from public.family_memberships fm where fm.adult_id = owner_rows.owner_id
    )
  returning id, created_by
),
inserted_memberships as (
  insert into public.family_memberships (family_id, adult_id, relationship)
  select id, created_by, 'owner'
  from created_families
  on conflict (family_id, adult_id) do nothing
  returning family_id, adult_id
),
family_for_owner as (
  select family_id, adult_id from inserted_memberships
  union
  select fm.family_id, fm.adult_id
  from public.family_memberships fm
  join owner_rows o on o.owner_id = fm.adult_id
),
inserted_relationships as (
  insert into public.adult_child_relationships (adult_id, student_id, family_id, relationship, created_by)
  select s.owner_id, s.id, f.family_id, 'parent', s.owner_id
  from public.students s
  join family_for_owner f on f.adult_id = s.owner_id
  on conflict (adult_id, student_id, relationship) do nothing
  returning adult_id, student_id, relationship
)
insert into public.child_permission_grants (adult_id, student_id, permission, granted_by, source)
select r.adult_id, r.student_id, d.permission, r.adult_id, 'relationship_default'
from inserted_relationships r
join public.relationship_permission_defaults d on d.relationship = r.relationship
on conflict (adult_id, student_id, permission) do nothing;

-- Keep auto-signup aligned with the relationship model.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
  family_id uuid;
  student_id uuid;
begin
  uname := coalesce(
    nullif(new.raw_user_meta_data->>'display_name', ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'Student'
  );

  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, uname)
  on conflict (id) do nothing;

  insert into public.families (name, created_by)
  values (uname || ' Family', new.id)
  returning id into family_id;

  insert into public.family_memberships (family_id, adult_id, relationship)
  values (family_id, new.id, 'owner')
  on conflict (family_id, adult_id) do nothing;

  insert into public.students (owner_id, name)
  values (new.id, uname)
  returning id into student_id;

  insert into public.adult_child_relationships (adult_id, student_id, family_id, relationship, created_by)
  values (new.id, student_id, family_id, 'parent', new.id)
  on conflict (adult_id, student_id, relationship) do nothing;

  insert into public.child_permission_grants (adult_id, student_id, permission, granted_by, source)
  select new.id, student_id, d.permission, new.id, 'relationship_default'
  from public.relationship_permission_defaults d
  where d.relationship = 'parent'
  on conflict (adult_id, student_id, permission) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
