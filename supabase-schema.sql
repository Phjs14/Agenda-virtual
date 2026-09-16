-- ============================================================
-- Agenda virtual — Fase 2 (Supabase)
-- Rode este script inteiro no SQL Editor do seu projeto Supabase
-- ============================================================

create table if not exists materias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  cor text not null default '#FFD66B',
  criado_em timestamptz not null default now()
);

create table if not exists atividades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  data date not null,
  materia_id uuid references materias(id) on delete set null,
  obs text,
  concluida boolean not null default false,
  concluida_em timestamptz,
  criado_em timestamptz not null default now()
);

alter table materias enable row level security;
alter table atividades enable row level security;

-- cada usuário só enxerga e mexe nos próprios dados
create policy "materias_select_proprio" on materias for select using (auth.uid() = user_id);
create policy "materias_insert_proprio" on materias for insert with check (auth.uid() = user_id);
create policy "materias_update_proprio" on materias for update using (auth.uid() = user_id);
create policy "materias_delete_proprio" on materias for delete using (auth.uid() = user_id);

create policy "atividades_select_proprio" on atividades for select using (auth.uid() = user_id);
create policy "atividades_insert_proprio" on atividades for insert with check (auth.uid() = user_id);
create policy "atividades_update_proprio" on atividades for update using (auth.uid() = user_id);
create policy "atividades_delete_proprio" on atividades for delete using (auth.uid() = user_id);

create index if not exists atividades_user_data_idx on atividades (user_id, data);
