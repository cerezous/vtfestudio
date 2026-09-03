alter table public.patients
  add column if not exists grupo_diagnostico text;

alter table public.patients
  drop constraint if exists patients_grupo_diagnostico_check;

alter table public.patients
  add constraint patients_grupo_diagnostico_check
  check (
    grupo_diagnostico is null
    or grupo_diagnostico in (
      'Neurológico',
      'Metabolico',
      'Traumatologico',
      'Gastroenterología',
      'Cardiologico',
      'Ginecologico'
    )
  );
