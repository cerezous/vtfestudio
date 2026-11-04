-- Modos invasivos del Puritan Bennett 980 en VMI: AC/VC, AC/PC, SIMV y espontáneo.

alter table public.clinical_records
  add column vent_mode text,
  add column fr numeric,
  add column pi numeric,
  add column ti numeric,
  add column flujo_pico numeric,
  add column flow_pattern text,
  add column rise numeric,
  add column esens numeric;

alter table public.clinical_records
  add constraint clinical_records_vent_mode_check
  check (
    vent_mode is null
    or vent_mode = any (array['ac_vc', 'ac_pc', 'simv', 'espontaneo'])
  );

alter table public.clinical_records
  add constraint clinical_records_fr_check
  check (fr is null or (fr >= 1 and fr <= 100));

alter table public.clinical_records
  add constraint clinical_records_pi_check
  check (pi is null or (pi >= 1 and pi <= 90));

alter table public.clinical_records
  add constraint clinical_records_ti_check
  check (ti is null or (ti >= 0.2 and ti <= 8));

alter table public.clinical_records
  add constraint clinical_records_flujo_pico_check
  check (flujo_pico is null or (flujo_pico >= 3 and flujo_pico <= 150));

alter table public.clinical_records
  add constraint clinical_records_flow_pattern_check
  check (flow_pattern is null or flow_pattern = any (array['square', 'ramp']));

alter table public.clinical_records
  add constraint clinical_records_rise_check
  check (rise is null or (rise >= 1 and rise <= 100));

alter table public.clinical_records
  add constraint clinical_records_esens_check
  check (esens is null or (esens >= 1 and esens <= 80));

alter table public.clinical_records
  add constraint clinical_records_vmi_mode_only
  check (
    support = 'vmi'
    or (
      vent_mode is null
      and fr is null
      and pi is null
      and ti is null
      and flujo_pico is null
      and flow_pattern is null
      and rise is null
      and esens is null
    )
  );

comment on column public.clinical_records.vent_mode is
  'Modo invasivo del Puritan Bennett 980: ac_vc, ac_pc, simv o espontaneo.';
comment on column public.clinical_records.fr is 'Frecuencia respiratoria programada (rpm).';
comment on column public.clinical_records.pi is 'Presión inspiratoria (cmH2O), AC/PC.';
comment on column public.clinical_records.ti is 'Tiempo inspiratorio (s), AC/PC.';
comment on column public.clinical_records.flujo_pico is 'Flujo pico programado (L/min), AC/VC y SIMV.';
comment on column public.clinical_records.flow_pattern is 'Patrón de flujo: square o ramp.';
comment on column public.clinical_records.rise is 'Rise time (%).';
comment on column public.clinical_records.esens is 'Sensibilidad espiratoria (%).';

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
  v_mode text;
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
  v_pct numeric;
  v_vt numeric;
  v_vt_pi numeric;
  v_peso_ideal numeric;
  v_fr numeric;
  v_pi numeric;
  v_ti numeric;
  v_flujo_pico numeric;
  v_pattern text;
  v_rise numeric;
  v_esens numeric;
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

  v_mode := nullif(btrim(coalesce(p_payload->>'vent_mode', '')), '');
  v_pattern := nullif(btrim(coalesce(p_payload->>'flow_pattern', '')), '');

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
  v_pct := private.as_numeric(p_payload->>'procalcitonina', 'Procalcitonina');
  v_vt := private.as_numeric(p_payload->>'vt', 'Vt');
  v_fr := private.as_numeric(p_payload->>'fr', 'FR');
  v_pi := private.as_numeric(p_payload->>'pi', 'PI');
  v_ti := private.as_numeric(p_payload->>'ti', 'Ti');
  v_flujo_pico := private.as_numeric(p_payload->>'flujo_pico', 'Flujo pico');
  v_rise := private.as_numeric(p_payload->>'rise', 'Rise');
  v_esens := private.as_numeric(p_payload->>'esens', 'Esens');

  if v_pcr is not null and (v_pcr < 0 or v_pcr > 500) then
    raise exception 'PCR debe estar entre 0 y 500.';
  end if;

  if v_lactato is not null and (v_lactato < 0 or v_lactato > 30) then
    raise exception 'Lactato debe estar entre 0 y 30.';
  end if;

  if v_pct is not null and (v_pct < 0 or v_pct > 200) then
    raise exception 'Procalcitonina debe estar entre 0 y 200.';
  end if;

  v_vt_pi := null;

  if v_support = 'vmi' then
    if not exists (
      select 1
      from public.clinical_milestones as m
      where m.patient_id = v_patient
        and m.kind in ('iot', 'tqt')
    ) then
      raise exception 'Para registrar VMI primero registra IOT o TQT.';
    end if;

    if v_peep is null or v_pmva is null or v_dp is null or v_iox is null then
      raise exception 'En VMI ingresa PEEP, PmVA, Driving Pressure e IOX.';
    end if;
    if v_vt is null or v_vt < 100 or v_vt > 1500 then
      raise exception 'En VMI ingresa Vt entre 100 y 1500 mL.';
    end if;

    if v_mode is null or v_mode not in ('ac_vc', 'ac_pc', 'simv', 'espontaneo') then
      raise exception 'Selecciona el modo del Puritan Bennett 980.';
    end if;

    if v_mode in ('ac_vc', 'ac_pc', 'simv') then
      if v_fr is null or v_fr < 1 or v_fr > 100 then
        raise exception 'Ingresa FR entre 1 y 100.';
      end if;
    else
      v_fr := null;
    end if;

    if v_mode = 'ac_pc' then
      if v_pi is null or v_pi < 1 or v_pi > 90 then
        raise exception 'Ingresa PI entre 1 y 90.';
      end if;
      if v_ti is null or v_ti < 0.2 or v_ti > 8 then
        raise exception 'Ingresa Ti entre 0,2 y 8.';
      end if;
    else
      v_pi := null;
      v_ti := null;
    end if;

    if v_mode in ('ac_vc', 'simv') then
      if v_flujo_pico is null or v_flujo_pico < 3 or v_flujo_pico > 150 then
        raise exception 'Ingresa flujo pico entre 3 y 150.';
      end if;
      if v_pattern is not null and v_pattern not in ('square', 'ramp') then
        raise exception 'El patrón de flujo es cuadrada o rampa.';
      end if;
    else
      v_flujo_pico := null;
      v_pattern := null;
    end if;

    if v_mode in ('simv', 'espontaneo') then
      if v_ps is null or v_ps < 0 or v_ps > 50 then
        raise exception 'Ingresa PS entre 0 y 50.';
      end if;
    else
      v_ps := null;
    end if;

    if v_mode in ('ac_pc', 'simv', 'espontaneo') then
      if v_rise is not null and (v_rise < 1 or v_rise > 100) then
        raise exception 'Rise debe estar entre 1 y 100.';
      end if;
    else
      v_rise := null;
    end if;

    if v_mode in ('simv', 'espontaneo') then
      if v_esens is not null and (v_esens < 1 or v_esens > 80) then
        raise exception 'Esens debe estar entre 1 y 80.';
      end if;
    else
      v_esens := null;
    end if;

    select p.peso_ideal into v_peso_ideal
    from public.patients as p
    where p.id = v_patient;

    if v_peso_ideal is not null and v_peso_ideal > 0 then
      v_vt_pi := round(v_vt / v_peso_ideal, 1);
    end if;

    v_epap := null;
    v_flujo := null;
  else
    v_vt := null;
    v_vt_pi := null;
    v_mode := null;
    v_fr := null;
    v_pi := null;
    v_ti := null;
    v_flujo_pico := null;
    v_pattern := null;
    v_rise := null;
    v_esens := null;

    if v_support = 'vmni' then
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
      patient_id, recorded_at, support, vent_mode, peep, pmva, driving_pressure,
      iox, ps, epap, flujo, fio2, vt, vt_ml_kg_pi, fr, pi, ti, flujo_pico,
      flow_pattern, rise, esens, pao2, paco2, hco3, eb, pafi, pcr, lactato,
      procalcitonina, created_by
    ) values (
      v_patient, v_recorded_at, v_support, v_mode, v_peep, v_pmva, v_dp,
      v_iox, v_ps, v_epap, v_flujo, v_fio2, v_vt, v_vt_pi, v_fr, v_pi, v_ti,
      v_flujo_pico, v_pattern, v_rise, v_esens, v_pao2, v_paco2, v_hco3, v_eb,
      v_pafi, v_pcr, v_lactato, v_pct, auth.uid()
    )
    returning * into v_row;
  else
    update public.clinical_records as r
    set
      recorded_at = v_recorded_at,
      support = v_support,
      vent_mode = v_mode,
      peep = v_peep,
      pmva = v_pmva,
      driving_pressure = v_dp,
      iox = v_iox,
      ps = v_ps,
      epap = v_epap,
      flujo = v_flujo,
      fio2 = v_fio2,
      vt = v_vt,
      vt_ml_kg_pi = v_vt_pi,
      fr = v_fr,
      pi = v_pi,
      ti = v_ti,
      flujo_pico = v_flujo_pico,
      flow_pattern = v_pattern,
      rise = v_rise,
      esens = v_esens,
      pao2 = v_pao2,
      paco2 = v_paco2,
      hco3 = v_hco3,
      eb = v_eb,
      pafi = v_pafi,
      pcr = v_pcr,
      lactato = v_lactato,
      procalcitonina = v_pct,
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
