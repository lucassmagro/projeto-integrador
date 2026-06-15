--
-- PostgreSQL database dump
--

\restrict yXsQvIYgycoey0fgT65VSNa1fxXaVveiDMRHnFiJ7dqgKBWDB6NdL8j4QtK9Rj3

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-06-15 16:14:51

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 7 (class 2615 OID 16748)
-- Name: sistema; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA sistema;


ALTER SCHEMA sistema OWNER TO postgres;

--
-- TOC entry 2 (class 3079 OID 17202)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA sistema;


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 233 (class 1255 OID 16843)
-- Name: fn_bloquear_update_registro(); Type: FUNCTION; Schema: sistema; Owner: postgres
--

CREATE FUNCTION sistema.fn_bloquear_update_registro() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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


ALTER FUNCTION sistema.fn_bloquear_update_registro() OWNER TO postgres;

--
-- TOC entry 232 (class 1255 OID 16841)
-- Name: sp_registrar_evolucao_clinica(bigint, bigint, bigint, integer, text, text, text); Type: PROCEDURE; Schema: sistema; Owner: postgres
--

CREATE PROCEDURE sistema.sp_registrar_evolucao_clinica(IN p_paciente_id bigint, IN p_consulta_id bigint, IN p_medico_id bigint, IN p_tipo_registro_id integer, IN p_diagnostico text, IN p_sintomas text, IN p_observacoes text)
    LANGUAGE plpgsql
    AS $$
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


ALTER PROCEDURE sistema.sp_registrar_evolucao_clinica(IN p_paciente_id bigint, IN p_consulta_id bigint, IN p_medico_id bigint, IN p_tipo_registro_id integer, IN p_diagnostico text, IN p_sintomas text, IN p_observacoes text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 230 (class 1259 OID 16822)
-- Name: audit_log; Type: TABLE; Schema: sistema; Owner: postgres
--

CREATE TABLE sistema.audit_log (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    paciente_id bigint NOT NULL,
    acao character varying(20) NOT NULL,
    data_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_origem character varying(45) NOT NULL,
    CONSTRAINT chk_acao CHECK (((acao)::text = ANY ((ARRAY['ESCRITA'::character varying, 'LEITURA'::character varying, 'RETIFICACAO'::character varying])::text[])))
);


ALTER TABLE sistema.audit_log OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16821)
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: sistema; Owner: postgres
--

CREATE SEQUENCE sistema.audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sistema.audit_log_id_seq OWNER TO postgres;

--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 229
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: sistema; Owner: postgres
--

ALTER SEQUENCE sistema.audit_log_id_seq OWNED BY sistema.audit_log.id;


--
-- TOC entry 224 (class 1259 OID 16761)
-- Name: prontuario; Type: TABLE; Schema: sistema; Owner: postgres
--

CREATE TABLE sistema.prontuario (
    id bigint NOT NULL,
    paciente_id bigint NOT NULL,
    data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE sistema.prontuario OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16760)
-- Name: prontuario_id_seq; Type: SEQUENCE; Schema: sistema; Owner: postgres
--

CREATE SEQUENCE sistema.prontuario_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sistema.prontuario_id_seq OWNER TO postgres;

--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 223
-- Name: prontuario_id_seq; Type: SEQUENCE OWNED BY; Schema: sistema; Owner: postgres
--

ALTER SEQUENCE sistema.prontuario_id_seq OWNED BY sistema.prontuario.id;


--
-- TOC entry 226 (class 1259 OID 16772)
-- Name: registro_clinico; Type: TABLE; Schema: sistema; Owner: postgres
--

CREATE TABLE sistema.registro_clinico (
    id bigint NOT NULL,
    prontuario_id bigint NOT NULL,
    consulta_id uuid NOT NULL,
    medico_id bigint,
    tipo_registro_id integer NOT NULL,
    diagnostico text,
    sintomas text,
    observacoes text,
    data_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    retificado boolean DEFAULT false NOT NULL
);


ALTER TABLE sistema.registro_clinico OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16771)
-- Name: registro_clinico_id_seq; Type: SEQUENCE; Schema: sistema; Owner: postgres
--

CREATE SEQUENCE sistema.registro_clinico_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sistema.registro_clinico_id_seq OWNER TO postgres;

--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 225
-- Name: registro_clinico_id_seq; Type: SEQUENCE OWNED BY; Schema: sistema; Owner: postgres
--

ALTER SEQUENCE sistema.registro_clinico_id_seq OWNED BY sistema.registro_clinico.id;


--
-- TOC entry 228 (class 1259 OID 16800)
-- Name: retificacao_registro; Type: TABLE; Schema: sistema; Owner: postgres
--

CREATE TABLE sistema.retificacao_registro (
    id bigint NOT NULL,
    registro_clinico_id bigint NOT NULL,
    medico_id bigint,
    motivo_retificacao text NOT NULL,
    conteudo_anterior text NOT NULL,
    conteudo_novo text NOT NULL,
    data_retificacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE sistema.retificacao_registro OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16799)
-- Name: retificacao_registro_id_seq; Type: SEQUENCE; Schema: sistema; Owner: postgres
--

CREATE SEQUENCE sistema.retificacao_registro_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sistema.retificacao_registro_id_seq OWNER TO postgres;

--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 227
-- Name: retificacao_registro_id_seq; Type: SEQUENCE OWNED BY; Schema: sistema; Owner: postgres
--

ALTER SEQUENCE sistema.retificacao_registro_id_seq OWNED BY sistema.retificacao_registro.id;


--
-- TOC entry 222 (class 1259 OID 16750)
-- Name: tipo_registro; Type: TABLE; Schema: sistema; Owner: postgres
--

CREATE TABLE sistema.tipo_registro (
    id integer NOT NULL,
    descricao character varying(50) NOT NULL
);


ALTER TABLE sistema.tipo_registro OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16749)
-- Name: tipo_registro_id_seq; Type: SEQUENCE; Schema: sistema; Owner: postgres
--

CREATE SEQUENCE sistema.tipo_registro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sistema.tipo_registro_id_seq OWNER TO postgres;

--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 221
-- Name: tipo_registro_id_seq; Type: SEQUENCE OWNED BY; Schema: sistema; Owner: postgres
--

ALTER SEQUENCE sistema.tipo_registro_id_seq OWNED BY sistema.tipo_registro.id;


--
-- TOC entry 231 (class 1259 OID 17225)
-- Name: vw_historico_clinico; Type: VIEW; Schema: sistema; Owner: postgres
--

CREATE VIEW sistema.vw_historico_clinico AS
 SELECT rc.id,
    p.id AS prontuario_id,
    rc.consulta_id,
    rc.tipo_registro_id,
    tr.descricao AS tipo_registro,
    p.paciente_id,
    rc.diagnostico,
    rc.sintomas,
    rc.observacoes,
    to_char(rc.data_registro, 'DD/MM/YYYY HH24:MI:SS'::text) AS data_registro,
    rc.retificado,
    rr.motivo_retificacao,
    rr.conteudo_novo,
    to_char(rr.data_retificacao, 'DD/MM/YYYY HH24:MI:SS'::text) AS data_retificacao,
    to_char(p.data_criacao, 'DD/MM/YYYY HH24:MI:SS'::text) AS prontuario_criado_em
   FROM (((sistema.registro_clinico rc
     JOIN sistema.prontuario p ON ((rc.prontuario_id = p.id)))
     JOIN sistema.tipo_registro tr ON ((rc.tipo_registro_id = tr.id)))
     LEFT JOIN sistema.retificacao_registro rr ON ((rr.registro_clinico_id = rc.id)))
  ORDER BY rc.data_registro DESC;


ALTER VIEW sistema.vw_historico_clinico OWNER TO postgres;

--
-- TOC entry 4902 (class 2604 OID 17000)
-- Name: audit_log id; Type: DEFAULT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.audit_log ALTER COLUMN id SET DEFAULT nextval('sistema.audit_log_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 17001)
-- Name: prontuario id; Type: DEFAULT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.prontuario ALTER COLUMN id SET DEFAULT nextval('sistema.prontuario_id_seq'::regclass);


--
-- TOC entry 4897 (class 2604 OID 17002)
-- Name: registro_clinico id; Type: DEFAULT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.registro_clinico ALTER COLUMN id SET DEFAULT nextval('sistema.registro_clinico_id_seq'::regclass);


--
-- TOC entry 4900 (class 2604 OID 17003)
-- Name: retificacao_registro id; Type: DEFAULT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.retificacao_registro ALTER COLUMN id SET DEFAULT nextval('sistema.retificacao_registro_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 17004)
-- Name: tipo_registro id; Type: DEFAULT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.tipo_registro ALTER COLUMN id SET DEFAULT nextval('sistema.tipo_registro_id_seq'::regclass);


--
-- TOC entry 5078 (class 0 OID 16822)
-- Dependencies: 230
-- Data for Name: audit_log; Type: TABLE DATA; Schema: sistema; Owner: postgres
--

COPY sistema.audit_log (id, user_id, paciente_id, acao, data_hora, ip_origem) FROM stdin;
\.


--
-- TOC entry 5072 (class 0 OID 16761)
-- Dependencies: 224
-- Data for Name: prontuario; Type: TABLE DATA; Schema: sistema; Owner: postgres
--

COPY sistema.prontuario (id, paciente_id, data_criacao) FROM stdin;
8	15	2026-06-15 12:59:47.354
\.


--
-- TOC entry 5074 (class 0 OID 16772)
-- Dependencies: 226
-- Data for Name: registro_clinico; Type: TABLE DATA; Schema: sistema; Owner: postgres
--

COPY sistema.registro_clinico (id, prontuario_id, consulta_id, medico_id, tipo_registro_id, diagnostico, sintomas, observacoes, data_registro, retificado) FROM stdin;
18	8	e6ec0138-a72f-4468-be6d-733f9707a6d6	\N	7	\N	Paciente relata dispneia (falta de ar) aos médios esforços, fadiga frequente e inchaço nos tornozelos que piora no final do dia. \r\nNega episódios de síncope (desmaio)	Edema de membros inferiores grau 2+/4+. Solicitado Ecocardiograma Transtorácico, Eletrocardiograma\r\n (ECG) e exames laboratoriais de rotina (incluindo BNP e perfil lipídico). Orientada dieta com restrição de sódio	2026-06-15 10:45:18.045672	f
21	8	e6ec0138-a72f-4468-be6d-733f9707a6d6	\N	9	Arritmia Cardíaca a esclarecer (suspeita de Fibrilação Atrial paroxística)	Paciente relata episódios de palpitações ("coração acelerado") que duram cerca de 10 minutos, ocorrendo de 2 a 3 vezes \r\npor semana, geralmente em repouso	Avaliado Eletrocardiograma trazido pelo paciente hoje, que apresentou ritmo sinusal normal. Instalado Holter de 24\r\n horas na clínica nesta manhã para investigação dos episódios relatados. Paciente orientado a registrar os sintomas no diário do aparelho.	2026-06-15 10:52:35.256423	f
20	8	e6ec0138-a72f-4468-be6d-733f9707a6d6	\N	5	Hipertensão Arterial Sistêmica (HAS) estágio 1 - Controlada	\N	Pressão arterial \r\naferida em consultório: 125/80 mmHg. Frequência cardíaca: 72 bpm. Paciente demonstra boa adesão ao tratamento medicamentoso e mudanças \r\nno estilo de vida. Mantida a prescrição atual (Losartana 50mg/dia). Retorno agendado para 6 meses	2026-06-15 10:49:29.784813	t
\.


--
-- TOC entry 5076 (class 0 OID 16800)
-- Dependencies: 228
-- Data for Name: retificacao_registro; Type: TABLE DATA; Schema: sistema; Owner: postgres
--

COPY sistema.retificacao_registro (id, registro_clinico_id, medico_id, motivo_retificacao, conteudo_anterior, conteudo_novo, data_retificacao) FROM stdin;
3	20	\N	Erro no diagnóstico	diagnostico: Hipertensão Arterial Sistêmica (HAS) estágio 1 - Controlada  	Hipertensão Arterial Sistêmica (HAS) estágio 2 - Controlada  	2026-06-15 18:38:47.531
\.


--
-- TOC entry 5070 (class 0 OID 16750)
-- Dependencies: 222
-- Data for Name: tipo_registro; Type: TABLE DATA; Schema: sistema; Owner: postgres
--

COPY sistema.tipo_registro (id, descricao) FROM stdin;
5	EVOLUCAO_MEDICA
6	EVOLUCAO_ENFERMAGEM
7	ANAMNESE
9	RETORNO
\.


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 229
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: sistema; Owner: postgres
--

SELECT pg_catalog.setval('sistema.audit_log_id_seq', 1, false);


--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 223
-- Name: prontuario_id_seq; Type: SEQUENCE SET; Schema: sistema; Owner: postgres
--

SELECT pg_catalog.setval('sistema.prontuario_id_seq', 8, true);


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 225
-- Name: registro_clinico_id_seq; Type: SEQUENCE SET; Schema: sistema; Owner: postgres
--

SELECT pg_catalog.setval('sistema.registro_clinico_id_seq', 23, true);


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 227
-- Name: retificacao_registro_id_seq; Type: SEQUENCE SET; Schema: sistema; Owner: postgres
--

SELECT pg_catalog.setval('sistema.retificacao_registro_id_seq', 3, true);


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 221
-- Name: tipo_registro_id_seq; Type: SEQUENCE SET; Schema: sistema; Owner: postgres
--

SELECT pg_catalog.setval('sistema.tipo_registro_id_seq', 9, true);


--
-- TOC entry 4916 (class 2606 OID 16835)
-- Name: audit_log pk_audit_log; Type: CONSTRAINT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.audit_log
    ADD CONSTRAINT pk_audit_log PRIMARY KEY (id);


--
-- TOC entry 4910 (class 2606 OID 16770)
-- Name: prontuario pk_prontuario; Type: CONSTRAINT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.prontuario
    ADD CONSTRAINT pk_prontuario PRIMARY KEY (id);


--
-- TOC entry 4912 (class 2606 OID 16788)
-- Name: registro_clinico pk_registro_clinico; Type: CONSTRAINT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.registro_clinico
    ADD CONSTRAINT pk_registro_clinico PRIMARY KEY (id);


--
-- TOC entry 4914 (class 2606 OID 16815)
-- Name: retificacao_registro pk_retificacao; Type: CONSTRAINT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.retificacao_registro
    ADD CONSTRAINT pk_retificacao PRIMARY KEY (id);


--
-- TOC entry 4906 (class 2606 OID 16757)
-- Name: tipo_registro pk_tipo_registro; Type: CONSTRAINT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.tipo_registro
    ADD CONSTRAINT pk_tipo_registro PRIMARY KEY (id);


--
-- TOC entry 4908 (class 2606 OID 16759)
-- Name: tipo_registro uq_tipo_registro_desc; Type: CONSTRAINT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.tipo_registro
    ADD CONSTRAINT uq_tipo_registro_desc UNIQUE (descricao);


--
-- TOC entry 4920 (class 2620 OID 16844)
-- Name: registro_clinico trg_bloquear_update_registro_clinico; Type: TRIGGER; Schema: sistema; Owner: postgres
--

CREATE TRIGGER trg_bloquear_update_registro_clinico BEFORE UPDATE ON sistema.registro_clinico FOR EACH ROW EXECUTE FUNCTION sistema.fn_bloquear_update_registro();


--
-- TOC entry 4917 (class 2606 OID 16789)
-- Name: registro_clinico fk_registro_prontuario; Type: FK CONSTRAINT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.registro_clinico
    ADD CONSTRAINT fk_registro_prontuario FOREIGN KEY (prontuario_id) REFERENCES sistema.prontuario(id);


--
-- TOC entry 4918 (class 2606 OID 16794)
-- Name: registro_clinico fk_registro_tipo; Type: FK CONSTRAINT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.registro_clinico
    ADD CONSTRAINT fk_registro_tipo FOREIGN KEY (tipo_registro_id) REFERENCES sistema.tipo_registro(id);


--
-- TOC entry 4919 (class 2606 OID 16816)
-- Name: retificacao_registro fk_retificacao_registro; Type: FK CONSTRAINT; Schema: sistema; Owner: postgres
--

ALTER TABLE ONLY sistema.retificacao_registro
    ADD CONSTRAINT fk_retificacao_registro FOREIGN KEY (registro_clinico_id) REFERENCES sistema.registro_clinico(id);


-- Completed on 2026-06-15 16:14:52

--
-- PostgreSQL database dump complete
--

\unrestrict yXsQvIYgycoey0fgT65VSNa1fxXaVveiDMRHnFiJ7dqgKBWDB6NdL8j4QtK9Rj3

