-- ============================================================
-- G5 - Prontuario - PostgreSQL
-- Projeto Integrador 2026 - Banco de Dados 1
-- ============================================================

-- ============================================================
-- TABELAS
-- ============================================================

-- Lookup dos tipos de registro clinico (3FN: evita literal repetido)
create table tipo_registro (
  id         serial      not null,
  descricao  varchar(50) not null,
  constraint pk_tipo_registro      primary key (id),
  constraint uq_tipo_registro_desc unique (descricao)
);

-- Prontuario: um por paciente (paciente_id referencia o modulo G1)
create table prontuario (
  id            bigserial not null,
  paciente_id   bigint    not null,
  data_criacao  timestamp not null default current_timestamp,
  constraint pk_prontuario primary key (id)
);

-- Registro clinico: imutavel apos persistencia (RF02)
-- Os campos de texto guardam o conteudo cifrado pela aplicacao (AES-256 - RNF05)
create table registro_clinico (
  id               bigserial not null,
  prontuario_id    bigint    not null,
  consulta_id      bigint    not null,  -- referencia externa G4
  medico_id        bigint    not null,  -- referencia externa G2
  tipo_registro_id integer   not null,
  diagnostico      text      not null,
  sintomas         text      not null,
  observacoes      text,
  data_registro    timestamp not null default current_timestamp,
  retificado       boolean   not null default false,
  constraint pk_registro_clinico    primary key (id),
  constraint fk_registro_prontuario foreign key (prontuario_id)    references prontuario(id),
  constraint fk_registro_tipo       foreign key (tipo_registro_id) references tipo_registro(id)
);

-- Retificacao: rastreabilidade sem sobrescrever o dado original (RF02)
create table retificacao_registro (
  id                  bigserial not null,
  registro_clinico_id bigint    not null,
  medico_id           bigint    not null,  -- referencia externa G2
  motivo_retificacao  text      not null,
  conteudo_anterior   text      not null,
  conteudo_novo       text      not null,
  data_retificacao    timestamp not null default current_timestamp,
  constraint pk_retificacao          primary key (id),
  constraint fk_retificacao_registro foreign key (registro_clinico_id) references registro_clinico(id)
);

-- Log de auditoria: exigencia LGPD para dados sensiveis (RNF05)
create table audit_log (
  id           bigserial   not null,
  user_id      bigint      not null,
  paciente_id  bigint      not null,
  acao         varchar(20) not null,
  data_hora    timestamp   not null default current_timestamp,
  ip_origem    varchar(45) not null,
  constraint pk_audit_log primary key (id),
  constraint chk_acao     check (acao in ('ESCRITA', 'LEITURA', 'RETIFICACAO'))
);

-- ============================================================
-- DADOS INICIAIS (seed)
-- ============================================================
insert into tipo_registro (descricao) values
  ('DIAGNOSTICO'),
  ('SINTOMA'),
  ('OBSERVACAO'),
  ('EVOLUCAO');

-- ============================================================
-- VIEW: vw_historico_clinico  (RF03)
-- Usada pela consulta de historico do paciente
-- ============================================================
create or replace view vw_historico_clinico as
select
  rc.id              as registro_id,
  p.paciente_id,
  p.id               as prontuario_id,
  rc.consulta_id,
  rc.medico_id,
  tr.descricao       as tipo_registro,
  rc.diagnostico,
  rc.sintomas,
  rc.observacoes,
  rc.data_registro,
  rc.retificado,
  p.data_criacao     as prontuario_criado_em
from registro_clinico rc
  inner join prontuario    p  on rc.prontuario_id    = p.id
  inner join tipo_registro tr on rc.tipo_registro_id = tr.id
order by rc.data_registro desc;

-- ============================================================
-- STORED PROCEDURE: sp_registrar_evolucao_clinica  (RF01)
-- Cria o prontuario caso nao exista e insere o registro clinico
-- ============================================================
create or replace procedure sp_registrar_evolucao_clinica(
  in p_paciente_id      bigint,
  in p_consulta_id      bigint,
  in p_medico_id        bigint,
  in p_tipo_registro_id integer,
  in p_diagnostico      text,
  in p_sintomas         text,
  in p_observacoes      text
)
language plpgsql
as $$
declare
  v_prontuario_id bigint;
begin
  -- Busca prontuario existente do paciente
  select id into v_prontuario_id
  from prontuario
  where paciente_id = p_paciente_id
  limit 1;

  -- Se nao existe, cria
  if v_prontuario_id is null then
    insert into prontuario (paciente_id)
    values (p_paciente_id)
    returning id into v_prontuario_id;
  end if;

  -- Insere o registro clinico (imutavel a partir daqui - RF02)
  insert into registro_clinico (
    prontuario_id, consulta_id, medico_id, tipo_registro_id,
    diagnostico, sintomas, observacoes
  ) values (
    v_prontuario_id, p_consulta_id, p_medico_id, p_tipo_registro_id,
    p_diagnostico, p_sintomas, p_observacoes
  );
end;
$$;

-- ============================================================
-- TRIGGER: trg_bloquear_update_registro_clinico  (RF02 / RNF05)
-- Garante a imutabilidade: bloqueia alteracao de dados clinicos.
-- Permite apenas a mudanca do flag 'retificado'.
-- ============================================================
create or replace function fn_bloquear_update_registro()
returns trigger
language plpgsql
as $$
begin
  if (new.diagnostico      is distinct from old.diagnostico      or
      new.sintomas         is distinct from old.sintomas         or
      new.observacoes      is distinct from old.observacoes      or
      new.consulta_id      is distinct from old.consulta_id      or
      new.medico_id        is distinct from old.medico_id        or
      new.tipo_registro_id is distinct from old.tipo_registro_id or
      new.prontuario_id    is distinct from old.prontuario_id) then
    raise exception 'Alteracao de registro clinico nao permitida. Utilize uma retificacao.';
  end if;
  return new;
end;
$$;

create trigger trg_bloquear_update_registro_clinico
before update on registro_clinico
for each row
execute function fn_bloquear_update_registro();
