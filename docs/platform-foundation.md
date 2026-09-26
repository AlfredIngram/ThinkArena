# Level Up Learning Platform Foundation

This is the north-star architecture for growing ThinkArena / Level Up Learning from a family MVP into one flexible learning platform for families, homeschoolers, teachers, tutors, classrooms, schools, and education organizations.

The main rule: a child has one persistent learning identity. Adults get scoped access to that child through relationships, classrooms, organizations, or future tutor/school contexts. We do not create duplicate child profiles just because the child learns in a new setting.

## What Exists Today

The current app already has:

- Supabase Auth adult accounts.
- `profiles` rows for authenticated adults.
- `students` rows for child/learner profiles. For now this is the child profile table.
- Auto-provisioning of a primary learner on signup.
- `weekly_lessons` and `student_progress` remote persistence.
- Local storage as fast/offline cache.
- RLS-protected access helpers in the private schema.
- Parent-managed `/learners`, including rename and last-learner protection.
- Avatar cosmetics stored on `students.avatar`.

## Phase 1 Foundation

Phase 1 keeps the existing app working and adds the missing relationship model:

- `families`: family/household tenant.
- `family_memberships`: adults in a family.
- `adult_child_relationships`: an adult's relationship to a learner.
- `permission_definitions`: canonical platform permissions.
- `relationship_permission_defaults`: default permission set for each relationship type.
- `child_permission_grants`: explicit per-child grants copied from relationship defaults.

This avoids a brittle `profiles.role = 'parent'` design. One adult can be a parent, homeschool educator, teacher, tutor, viewer, or organization admin in different scopes.

### Phase 1 Permission Names

- `view_child_profile`
- `manage_child_profile`
- `view_child_progress`
- `view_reports`
- `create_assignment`
- `edit_assignment`
- `approve_completion`
- `manage_rewards`
- `manage_avatar`
- `invite_users`
- `manage_billing`
- `delete_child`

### Relationship Defaults

Parent and guardian get broad management rights. Homeschool educators can assign and review learning. Grandparents and viewers can observe, with grandparent reward powers. Caregivers can assign and approve work but not manage billing or delete a child.

RLS should use server-side permission helpers, not frontend-only checks.

## Entity Map

```text
auth.users
  | 1:1
profiles
  |
  | adult_id
family_memberships ---- families
  |
  | adult_id
adult_child_relationships ---- students
  |
child_permission_grants ---- permission_definitions

students
  | 1:many
weekly_lessons
  | 1:1
student_progress
```

Future phases extend this without replacing it:

```text
organizations -> organization_memberships -> classrooms -> classroom_memberships
students -> assignments -> assignment_activities -> activity_attempts -> activity_results
students -> learning_events -> reward_events -> xp_transactions / coin_transactions
students -> child_inventory / avatar_profiles / child_companions / child_eggs
```

## Data Boundaries

Learning and gamification stay separate.

Learning tables answer:

- What was assigned?
- What did the child attempt?
- What was correct or incorrect?
- What skills are improving?
- What needs practice?

Gamification tables answer:

- What rewards did learning events produce?
- What XP or coins were earned?
- What items are owned or equipped?
- What achievements, streaks, companions, or eggs progressed?

Learning modules should emit events. Reward systems consume those events. A spelling activity should not know how to hatch an egg.

## Phase 2 Learning Model

Add these behind the existing UI:

- `learning_sources`: uploaded homework, typed text, PDFs, image OCR, URLs, imported schoolwork, AI-generated content metadata.
- `subjects`: math, spelling, reading, writing, science, Bible/verse, custom.
- `skills`: durable concepts such as multiplication facts, vowel teams, fractions, reading fluency.
- `assignments`: generic unit of assigned work with creator, visibility, due date, target metadata, content, and reward config.
- `assignment_targets`: targets a child, family, classroom, organization, or future group.
- `assignment_activities`: concrete activities generated from an assignment.
- `activity_attempts`: each try by the child.
- `activity_results`: normalized outcome/score/mastery summary.
- `learning_events`: append-only learning event stream.
- `child_skill_progress`: durable mastery by child and skill.

Do not create separate database tables per subject. Subject-specific content can live in structured JSONB on generic assignments/activities until a field becomes important enough to query globally.

## Phase 3 Gamification Model

Move from cached totals to ledgers:

- `xp_transactions`: append-only XP ledger.
- `coin_transactions`: append-only coin ledger with `balance_after`.
- `reward_events`: outputs from learning events.
- `reward_definitions`: data-driven reward rules.
- `achievement_definitions` and `child_achievements`.
- `streaks`: configurable streak types and schedules.
- `item_categories`, `item_rarities`, `items`.
- `child_inventory`, `item_transactions`, `item_unlock_requirements`.
- `avatar_profiles`: queryable equipped slots instead of one large cosmetic object when equipment needs become richer.

Keep cached `xp`, `level`, and `coins` on the child profile for fast UI, but treat the ledgers as the source of truth.

## Phase 4 Companion Foundation

Add the data model before exposing the full product:

- `companion_species`
- `companions`
- `child_companions`
- `companion_progress`
- `companion_evolution_paths`
- `eggs`
- `child_eggs`
- collection/unlock tables as needed

No negative punishment mechanics. Progress can slow or pause; companions should not die, become permanently sick, or lose earned progress because a child missed learning time.

## Phase 5 Organization Readiness

Add and keep behind feature flags:

- `organizations`
- `organization_memberships`
- `organization_roles`
- `organization_permissions`
- `classrooms`
- `classroom_memberships`
- classroom assignment targeting
- teacher/tutor visibility scopes

Teachers and tutors should only see learning data connected to their authorized context. They should not automatically see private family-created assignments or reports.

## Visibility Scopes

Assignments, learning records, and reports need explicit visibility:

- `private_child`
- `family`
- `classroom`
- `organization`
- `assigner_only`
- `child_and_assigner`
- future `public_resource`

Visibility should be enforced in RLS and service functions. The UI can hide controls for clarity, but it is not the security boundary.

## Service Modules

React components should stay presentational. Business logic belongs in services:

- `authService`
- `familyService`
- `childService`
- `permissionService`
- `assignmentService`
- `learningService`
- `rewardService`
- `inventoryService`
- `companionService`
- `organizationService`
- `subscriptionService`
- `notificationService`
- `analyticsService`
- future `aiService`

AI should be provider-abstracted and logged with prompt version, model, input source, output metadata, confidence, cost, and timestamp. Do not scatter provider-specific calls through components.

## Feature Flags

Introduce a central feature flag service/table before adding teacher and companion UI:

- `companions`
- `eggs`
- `teacher_mode`
- `classrooms`
- `homeschool_mode`
- `ai_photo_upload`
- `school_accounts`
- `tutor_mode`

Avoid `if (plan === 'pro')` across the app. Use entitlements and feature checks.

## RLS Rules

Principles:

- Adults can access a child only through a valid relationship or scoped class/org membership.
- Parents/guardians can manage family data.
- Teachers can access classroom-scoped educational data only.
- Tutors can access tutor-assigned activity and allowed progress only.
- Family users cannot modify teacher-owned classroom assignments unless granted.
- No child learning data is publicly discoverable.
- Service-role work stays server-side. The browser never receives service-role keys.

Phase 1 helper direction:

- `private.has_child_permission(child_id, permission_name)` gates child-level access.
- `private.can_access_student(child_id)` maps to `view_child_profile` / own child login.
- `private.owns_student(child_id)` maps to `manage_child_profile` / current owner compatibility.

## Subscription Readiness

Subscription ownership should support:

- adult account
- family
- teacher
- organization
- school

Entitlements should be centralized:

- AI generations per month
- max children
- max classes
- advanced reports
- premium items
- custom rewards
- photo homework import

## Audit And Privacy

Log significant account and child-data actions:

- adult linked to child
- child added to classroom
- permission changed
- assignment created/deleted
- reward or coins manually adjusted
- account removed
- organization member added

Privacy defaults:

- no child email requirement
- no exact birthdate unless there is a clear product need
- no public profiles
- no open child-to-child chat
- no unnecessary school/location/social data for family-only users
- deletion/export paths should be designed before school/tutor scale

## Migration Path

1. Keep `students` as the current child profile table. Add relationship/permission tables around it.
2. Backfill one family and parent relationship for existing learners.
3. Move client access from owner-only assumptions toward permission-aware helpers.
4. Add learning assignment tables and event records while still writing current `weekly_lessons` / `student_progress`.
5. Add reward ledgers and migrate cached XP/coins into transaction history.
6. Rename or wrap `students` as `child_profiles` only after the platform model is stable.

The app should remain usable after each phase.
