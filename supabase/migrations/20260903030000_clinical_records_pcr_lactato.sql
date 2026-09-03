-- PCR y lactato en registros clínicos (exámenes). Escritura sigue solo por RPC.

alter table public.clinical_records
  add column if not exists pcr numeric;

alter table public.clinical_records
  add column if not exists lactato numeric;

alter table public.clinical_records
  drop constraint if exists clinical_records_pcr_check;

alter table public.clinical_records
  add constraint clinical_records_pcr_check
  check (pcr is null or (pcr >= 0 and pcr <= 500));

alter table public.clinical_records
  drop constraint if exists clinical_records_lactato_check;

alter table public.clinical_records
  add constraint clinical_records_lactato_check
  check (lactato is null or (lactato >= 0 and lactato <= 30));

comment on column public.clinical_records.pcr is 'Proteína C reactiva (mg/L).';
comment on column public.clinical_records.lactato is 'Ácido láctico / lactato (mmol/L).';

create or replace function private.upsert_clinical_record(p_id uuid, p_payload jsonb)
returns public.clinical_records
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_row public.clinical_records;
  v_patient uuid;
  v_recorded_at timestamptz;
  v_support text;
  v_peep numeric;
  v_pmva numeric;
  v_dp numeric;
  v_iox numeric;
  v_ps numeric;
  v_epap numeric;
  v_flujo numeric;
  v_fio2 numeric;
  v_pao2 numeric;
  v_paco2 numeric;
  v_hco3 numeric;
  v_eb numeric;
  v_pafi numeric;
  v_pcr numeric;
  v_lactato numeric;
  v_count integer;
begin
  if not private.is_active_staff() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Datos inválidos.';
  end if;

  begin
    v_patient := (p_payload->>'patient_id')::uuid;
  exception
    when others then
      raise exception 'Paciente inválido.';
  end;

  if v_patient is null then
    raise exception 'Paciente inválido.';
  end if;

  if not exists (select 1 from public.patients p where p.id = v_patient) then
    raise exception 'Paciente no encontrado.';
  end if;

  begin
    v_recorded_at := (p_payload->>'recorded_at')::timestamptz;
  exception
    when others then
      raise exception 'Indica la fecha del registro.';
  end;

  if v_recorded_at is null then
    raise exception 'Indica la fecha del registro.';
  end if;

  v_support := nullif(btrim(coalesce(p_payload->>'support', '')), '');
  if v_support is null or v_support not in (
    'vmi', 'vmni', 'cnaf', 'venturi', 'reservorio', 'naricera', 'ambiental'
  ) then
    raise exception 'Selecciona el soporte.';
  end if;

  v_fio2 := private.as_numeric(p_payload->>'fio2', 'FiO2');
  if v_fio2 is null or v_fio2 < 21 or v_fio2 > 100 then
    raise exception 'Ingresa FiO2 entre 21 y 100.';
  end if;

  v_peep := private.as_numeric(p_payload->>'peep', 'PEEP');
  v_pmva := private.as_numeric(p_payload->>'pmva', 'PmVA');
  v_dp := private.as_numeric(p_payload->>'driving_pressure', 'Driving Pressure');
  v_iox := private.as_numeric(p_payload->>'iox', 'IOX');
  v_ps := private.as_numeric(p_payload->>'ps', 'PS');
  v_epap := private.as_numeric(p_payload->>'epap', 'EPAP');
  v_flujo := private.as_numeric(p_payload->>'flujo', 'Flujo');
  v_pao2 := private.as_numeric(p_payload->>'pao2', 'PaO2');
  v_paco2 := private.as_numeric(p_payload->>'paco2', 'PaCO2');
  v_hco3 := private.as_numeric(p_payload->>'hco3', 'HCO3');
  v_eb := private.as_numeric(p_payload->>'eb', 'EB');
  v_pcr := private.as_numeric(p_payload->>'pcr', 'PCR');
  v_lactato := private.as_numeric(p_payload->>'lactato', 'Lactato');

  if v_pcr is not null and (v_pcr < 0 or v_pcr > 500) then
    raise exception 'PCR debe estar entre 0 y 500.';
  end if;

  if v_lactato is not null and (v_lactato < 0 or v_lactato > 30) then
    raise exception 'Lactato debe estar entre 0 y 30.';
  end if;

  if v_support = 'vmi' then
    if v_peep is null or v_pmva is null or v_dp is null or v_iox is null then
      raise exception 'En VMI ingresa PEEP, PmVA, Driving Pressure e IOX.';
    end if;
    v_ps := null;
    v_epap := null;
    v_flujo := null;
  elsif v_support = 'vmni' then
    if v_ps is null or v_epap is null then
      raise exception 'En VMNI ingresa PS y EPAP.';
    end if;
    v_peep := null;
    v_pmva := null;
    v_dp := null;
    v_iox := null;
    v_flujo := null;
  elsif v_support in ('cnaf', 'venturi', 'reservorio', 'naricera') then
    if v_flujo is null then
      raise exception 'Ingresa el flujo.';
    end if;
    v_peep := null;
    v_pmva := null;
    v_dp := null;
    v_iox := null;
    v_ps := null;
    v_epap := null;
  else
    v_peep := null;
    v_pmva := null;
    v_dp := null;
    v_iox := null;
    v_ps := null;
    v_epap := null;
    v_flujo := null;
  end if;

  if v_pao2 is not null and v_fio2 > 0 then
    v_pafi := round(v_pao2 / (v_fio2 / 100.0));
  else
    v_pafi := null;
  end if;

  if p_id is null then
    select count(*) into v_count
    from public.clinical_records as r
    where r.patient_id = v_patient;

    if v_count >= 30 then
      raise exception 'Este paciente ya tiene 30 registros.';
    end if;

    insert into public.clinical_records (
      patient_id,
      recorded_at,
      support,
      peep,
      pmva,
      driving_pressure,
      iox,
      ps,
      epap,
      flujo,
      fio2,
      pao2,
      paco2,
      hco3,
      eb,
      pafi,
      pcr,
      lactato,
      created_by
    ) values (
      v_patient,
      v_recorded_at,
      v_support,
      v_peep,
      v_pmva,
      v_dp,
      v_iox,
      v_ps,
      v_epap,
      v_flujo,
      v_fio2,
      v_pao2,
      v_paco2,
      v_hco3,
      v_eb,
      v_pafi,
      v_pcr,
      v_lactato,
      auth.uid()
    )
    returning * into v_row;
  else
    update public.clinical_records as r
    set
      recorded_at = v_recorded_at,
      support = v_support,
      peep = v_peep,
      pmva = v_pmva,
      driving_pressure = v_dp,
      iox = v_iox,
      ps = v_ps,
      epap = v_epap,
      flujo = v_flujo,
      fio2 = v_fio2,
      pao2 = v_pao2,
      paco2 = v_paco2,
      hco3 = v_hco3,
      eb = v_eb,
      pafi = v_pafi,
      pcr = v_pcr,
      lactato = v_lactato,
      updated_at = now()
    where r.id = p_id
      and r.patient_id = v_patient
    returning * into v_row;

    if v_row.id is null then
      raise exception 'Registro no encontrado.';
    end if;
  end if;

  return v_row;
end;
$function$;
