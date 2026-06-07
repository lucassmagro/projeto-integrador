import { Link } from "react-router-dom";

const REPO = "https://github.com/lucassmagro/projeto-integrador";

const funcionalidades = [
  {
    nome: "Registro clínico",
    desc: "Criação de evoluções médicas e de enfermagem, anamneses e observações vinculadas a uma consulta. Após gravado, o registro é imutável.",
    operacao: "POST /registro-clinico",
  },
  {
    nome: "Histórico clínico",
    desc: "Consulta do prontuário do paciente com todos os registros em ordem cronológica (mais recente primeiro).",
    operacao: "GET /prontuario/paciente/:id",
  },
  {
    nome: "Retificação formal",
    desc: "Correção de um registro sem alterar o original: gera trilha de auditoria com médico, motivo e conteúdo anterior/novo.",
    operacao: "POST /retificacao",
  },
  {
    nome: "Tipos de registro",
    desc: "Classificação do registro (evolução médica, evolução de enfermagem, anamnese, observação de enfermagem).",
    operacao: "GET /tipo-registro",
  },
];

const fluxo = [
  {
    passo: "01",
    nome: "Consulta",
    desc: "Uma consulta ativa no módulo G4 origina o atendimento.",
  },
  {
    passo: "02",
    nome: "Registro",
    desc: "O profissional grava a evolução clínica vinculada à consulta.",
  },
  {
    passo: "03",
    nome: "Histórico",
    desc: "O registro passa a compor o prontuário do paciente, em ordem cronológica.",
  },
  {
    passo: "04",
    nome: "Retificação",
    desc: "Correções geram um registro de retificação, preservando o dado original.",
  },
];

const integracoes = [
  {
    grupo: "G4",
    modulo: "Consultas",
    relacao: "Consome",
    dado: "Consulta que origina o registro (validada antes de gravar)",
  },
  {
    grupo: "G6",
    modulo: "Receitas",
    relacao: "Fornece",
    dado: "Histórico clínico para emissão de receitas",
  },
  {
    grupo: "G7",
    modulo: "Exames",
    relacao: "Fornece",
    dado: "Contexto diagnóstico para solicitação de exames",
  },
  {
    grupo: "G12",
    modulo: "Telemedicina",
    relacao: "Fornece",
    dado: "Acesso ao prontuário em atendimentos remotos",
  },
];

const endpoints = [
  { metodo: "GET", rota: "/tipo-registro", desc: "Lista os tipos de registro" },
  {
    metodo: "GET",
    rota: "/prontuario/paciente/:paciente_id",
    desc: "Prontuário e registros de um paciente",
  },
  {
    metodo: "GET",
    rota: "/prontuario/:id",
    desc: "Prontuário por ID (consumido por G6, G7, G12)",
  },
  {
    metodo: "GET",
    rota: "/registro-clinico/:id",
    desc: "Registro clínico por ID",
  },
  {
    metodo: "POST",
    rota: "/registro-clinico",
    desc: "Cria registro clínico (valida a consulta no G4)",
  },
  {
    metodo: "GET",
    rota: "/retificacao/registro/:id",
    desc: "Lista retificações de um registro",
  },
  {
    metodo: "POST",
    rota: "/retificacao",
    desc: "Cria retificação (preserva o dado original)",
  },
];

function SectionHead({ title, sub }) {
  return (
    <div className="panel-head">
      <div>
        <div className="panel-title">{title}</div>
        {sub && <div className="panel-sub">{sub}</div>}
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="main-container">
      <div className="doc-masthead">
        <div className="doc-eyebrow">Módulo G5 · Documentação operacional</div>
        <h1 className="doc-title">Prontuário Eletrônico</h1>
        <p className="doc-lead">
          Registro e consulta do histórico clínico dos pacientes do Sistema de
          Saúde Integrado. Os registros são imutáveis e correções são tratadas
          por retificação formal, garantindo rastreabilidade e trilha de
          auditoria.
        </p>
        <div className="doc-meta">
          <div className="m">
            <div className="m-k">Versão</div>
            <div className="m-v">1.0</div>
          </div>
          <div className="m">
            <div className="m-k">Ambiente</div>
            <div className="m-v">Acadêmico</div>
          </div>
          <div className="m">
            <div className="m-k">Back-end</div>
            <div className="m-v">
              Node.js · Express · Sequelize · PostgreSQL
            </div>
          </div>
          <div className="m">
            <div className="m-k">Repositório</div>
            <div className="m-v">
              <a href={REPO} target="_blank" rel="noreferrer">
                projeto-integrador
              </a>
            </div>
          </div>
        </div>
      </div>

      <section className="panel">
        <SectionHead
          title="Sobre o módulo"
          sub="Finalidade e papel no sistema integrado"
        />
        <div className="panel-body">
          <dl className="deflist">
            <div className="dl-row">
              <dt>O que é</dt>
              <dd>
                Componente responsável pelo prontuário eletrônico: centraliza o
                histórico clínico de cada paciente em um único conjunto de
                registros.
              </dd>
            </div>
            <div className="dl-row">
              <dt>Finalidade</dt>
              <dd>
                Garantir um registro confiável e auditável dos atendimentos, com
                integridade dos dados clínicos ao longo do tempo.
              </dd>
            </div>
            <div className="dl-row">
              <dt>Papel no sistema</dt>
              <dd>
                Recebe dados de consulta do módulo G4 e fornece o histórico
                clínico aos módulos de Receitas (G6), Exames (G7) e
                Telemedicina (G12).
              </dd>
            </div>
          </dl>
          <p className="prose" style={{ marginTop: 16 }}>
            A <strong>imutabilidade</strong> é a regra central do módulo: uma
            vez gravado, um registro clínico não é alterado. Qualquer correção é
            feita por meio de uma <strong>retificação</strong>, que preserva o
            conteúdo original e registra médico responsável, motivo e data,
            formando a trilha de auditoria.
          </p>
        </div>
      </section>

      <section className="panel">
        <SectionHead
          title="Funcionalidades"
          sub="Recursos disponíveis no módulo e operação correspondente"
        />
        <div className="panel-body panel-body--flush">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>Funcionalidade</th>
                  <th>Descrição</th>
                  <th style={{ width: "26%" }}>Operação</th>
                </tr>
              </thead>
              <tbody>
                {funcionalidades.map((f) => (
                  <tr key={f.nome}>
                    <td style={{ fontWeight: 600 }}>{f.nome}</td>
                    <td className="muted">{f.desc}</td>
                    <td>
                      <span className="mono">{f.operacao}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionHead
          title="Fluxo operacional"
          sub="Da consulta ao histórico clínico"
        />
        <div className="panel-body">
          <div
            className="form-grid--row"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {fluxo.map((p) => (
              <div
                key={p.passo}
                style={{
                  background: "var(--row-head)",
                  border: "1px solid var(--line)",
                  padding: "16px",
                  borderRadius: "6px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  {p.passo}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--ink)",
                    margin: "4px 0 8px",
                  }}
                >
                  {p.nome}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--ink-2)",
                    lineHeight: 1.5,
                  }}
                >
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionHead
          title="Integrações"
          sub="Módulos que fornecem dados ao prontuário e que o consomem"
        />
        <div className="panel-body panel-body--flush">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Grupo</th>
                  <th style={{ width: "20%" }}>Módulo</th>
                  <th style={{ width: 120 }}>Relação</th>
                  <th>Dado trafegado</th>
                </tr>
              </thead>
              <tbody>
                {integracoes.map((it) => (
                  <tr key={it.grupo}>
                    <td>
                      <span className="id-ref">{it.grupo}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{it.modulo}</td>
                    <td>
                      <span
                        className={`tag`}
                        style={
                          it.relacao === "Fornece"
                            ? {
                                color: "var(--ok-fg)",
                                background: "var(--ok-bg)",
                                borderColor: "var(--ok-line)",
                              }
                            : undefined
                        }
                      >
                        {it.relacao}
                      </span>
                    </td>
                    <td className="muted">{it.dado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tablenote" style={{ padding: "0 16px 16px" }}>
            <strong>Consome:</strong> dados que o prontuário recebe de outros
            módulos. <strong>Fornece:</strong> dados que o prontuário
            disponibiliza aos demais.
          </p>
        </div>
      </section>

      <section className="panel">
        <SectionHead
          title="Endpoints da API"
          sub="Interface REST · http://localhost:3005"
        />
        <div className="panel-body panel-body--flush">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Método</th>
                  <th style={{ width: "42%" }}>Rota</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((e) => (
                  <tr key={e.metodo + e.rota}>
                    <td>
                      <span
                        className="tag"
                        style={
                          e.metodo === "POST"
                            ? {
                                color: "var(--warn-fg)",
                                background: "var(--warn-bg)",
                                borderColor: "var(--warn-line)",
                              }
                            : undefined
                        }
                      >
                        {e.metodo}
                      </span>
                    </td>
                    <td>
                      <span className="mono">{e.rota}</span>
                    </td>
                    <td className="muted">{e.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionHead
          title="Projeto Integrador"
          sub="Grupo 5, contexto acadêmico"
        />
        <div className="panel-body">
          <p className="prose" style={{ marginBottom: 16 }}>
            Módulo desenvolvido pelo <strong>Grupo 5</strong> como parte do
            Projeto Integrador do curso de Sistemas de Informação. O objetivo é
            integrar, em um sistema hospitalar único, as competências das
            disciplinas do semestre.
          </p>
          <dl className="deflist">
            <div className="dl-row" style={{ gridTemplateColumns: "1fr" }}>
              <dt>Integrantes</dt>
              <dd>
                Alexandre Reitemeyer · Beatriz Miranda · Lucas Santos Magro
              </dd>
            </div>
            <div className="dl-row" style={{ gridTemplateColumns: "1fr" }}>
              <dt>Atividades</dt>
              <dd>
                <Link to="/busca">Consultar histórico</Link>
                {" · "}
                <Link to="/registro">Registrar evolução</Link>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="panel">
        <SectionHead title="Repositório" sub="Código-fonte no GitHub" />
        <div className="panel-body">
          <div
            className="repo"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              margin: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <i
                className="bi bi-github"
                style={{ fontSize: "28px", color: "var(--ink)" }}
              ></i>
              <div className="repo-url" style={{ margin: 0 }}>
                {REPO}
              </div>
            </div>
            <a
              className="btn btn--default"
              href={REPO}
              target="_blank"
              rel="noreferrer"
            >
              <i className="bi bi-box-arrow-up-right"></i> Abrir Repositório
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
