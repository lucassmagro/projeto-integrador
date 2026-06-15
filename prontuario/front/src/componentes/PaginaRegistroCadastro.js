import { useState, useEffect } from "react";
import { post, get } from "../servicos/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { labelTipo } from "../utils/tipoRegistroLabels";
const url_g4 = process.env.REACT_APP_API_G4 + 'consultations?status=completed'//rota e filtro de para consultas realizadas 
const token_g4 = process.env.REACT_APP_TOKEN_G4;

function PaginaRegistroCadastro() {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [listConsultas, setListConsultas] = useState([])

  const [form, setForm] = useState({
    consulta_id: "",
    tipo_registro_id: "",
    diagnostico: "",
    sintomas: "",
    observacoes: "",
  });

  useEffect(() => {
    const carregarTipos = async () => {
      try {
        const dados = await get("tipo-registro");
        setTipos(dados);
        if (dados.length > 0)
          setForm((f) => ({ ...f, tipo_registro_id: dados[0].id }));
      } catch (erro) {
        toast.error("Erro ao carregar tipos de registro.");
      }
    };
    carregarTipos();
  }, []);

  useEffect(() => {
    if (listConsultas.length === 0) {
      getListConsultas();
    }
  }, [])

  async function carregarHistorico(id) {
    if (!id) {
      setHistorico([]);
      return;
    }
    try {
      const prontuario = await get(`prontuario/paciente/${id}`);
      setHistorico(prontuario.registros || []);
    } catch (erro) {
      setHistorico([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const filtrarMock = (lista, valor) => {
    const termo = valor.trim().toLowerCase();
    if (!termo) return [];
    const ehNumero = /^\d+$/.test(termo);
    return lista
      .filter((item) =>
        ehNumero
          ? String(item.id).startsWith(termo)
          : item.nome.toLowerCase().includes(termo),
      )
      .slice(0, 5);
  };

  const dropdownStyle = {
    listStyle: "none",
    margin: "4px 0 0",
    padding: "4px",
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 9999,
    background: "white",
    border: "1px solid var(--line)",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    maxHeight: "200px",
    overflowY: "auto",
  };
  const dropdownItemStyle = {
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "14px",
    color: "#1a1a1a",
  };

  const formatarData = (data) => {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
  };

  const placeholderStyle = {
    fontStyle: "italic",
    color: "var(--text-muted, #9ca3af)",
  };

  const tipoSelecionado = tipos.find(
    (t) => String(t.id) === String(form.tipo_registro_id),
  );
  const descricaoTipo = tipoSelecionado?.descricao || "";
  const descricaoPorId = (id) =>
    labelTipo(tipos.find((t) => String(t.id) === String(id))?.descricao || id);

  // Campos mostrados dependem do tipo de registro
  const mostrarDiagnostico =
    descricaoTipo === "EVOLUCAO_MEDICA" ||
    descricaoTipo === "RETORNO" ||
    descricaoTipo === "EVOLUCAO_ENFERMAGEM";
  const mostrarSintomas =
    descricaoTipo === "RETORNO" ||
    descricaoTipo === "EVOLUCAO_MEDICA" ||
    descricaoTipo === "EVOLUCAO_ENFERMAGEM" ||
    descricaoTipo === "ANAMNESE";
  // const mostrarObservacoes = descricaoTipo === "OBSERVACAO";

  const salvar = async () => {
    if (!form.consulta_id) {
      toast.warning("Selecione a consulta.");
      return;
    }
    if (!form.tipo_registro_id) {
      toast.warning("Selecione o tipo de registro.");
      return;
    }
    if (mostrarDiagnostico && !form.diagnostico) {
      toast.warning("Preencha o diagnóstico.");
      return;
    }
    if (mostrarSintomas && !form.sintomas) {
      toast.warning("Preencha os sintomas.");
      return;
    }

    setCarregando(true);
    try {
      await post("registro-clinico", {
        consulta_id: form.consulta_id,
        tipo_registro_id: Number(form.tipo_registro_id),
        diagnostico: mostrarDiagnostico ? form.diagnostico : "",
        sintomas: mostrarSintomas ? form.sintomas : "",
        observacoes: form.observacoes,
      });
      toast.success("Registro clínico salvo com sucesso!");
      navigate("/busca");
    } catch (erro) {
      const msg = erro.response?.data?.mensagem || erro.message;
      toast.error("Erro ao salvar: " + msg);
    }
    setCarregando(false);
  };

  async function getListConsultas() {
    try {
      const response = await fetch(url_g4, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${token_g4}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      let paciente_id = result.data.map(item =>item.patientId ) ;
      const selectOptions = result.data.map(item => ({
        value: item.id,
        label: `${item.doctorName} - ${item.specialty}`
      }));

      setListConsultas(selectOptions)

      setForm((f) => ({ ...f, consulta_id: selectOptions[0].value }));

      carregarHistorico(paciente_id[0])
    } catch (error) {
      const msg = error.response?.data?.mensagem || error.message;
      toast.error("Erro ao buscar consultas: " + msg);
    }
  }


  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Novo Registro Clínico</div>
          <div className="panel-sub">
            Evolução clínica vinculada à consulta corrente.
          </div>
        </div>
      </div>

      <div className="panel-body panel-body--flush">
        <div
          className="clinical-banner"
          style={{
            border: "none",
            borderBottom: "1px solid var(--line)",
            borderRadius: 0,
            marginBottom: 0,
          }}
        >
          <div className="cb-main">
            <div className="cb-avatar">
              <i className="bi bi-person"></i>
            </div>
            <div className="cb-info">
              <div className="cb-name">
                {form.paciente_id ? (
                  `Paciente #${form.paciente_id}`
                ) : (
                  <span style={placeholderStyle}>Informe o ID do paciente</span>
                )}
              </div>
              <div className="cb-id">
                {form.consulta_id ? (
                  `Consulta #${form.consulta_id}`
                ) : (
                  <span style={placeholderStyle}>Consulta não informada</span>
                )}
              </div>
            </div>
          </div>
          {/* <div className="cb-meta">
            <div className="cb-meta-item">
              <span className="cb-meta-label">Médico Responsável</span>
              <span className="cb-meta-value">
                {form.medico_id ? (
                  `#${form.medico_id}`
                ) : (
                  <span style={placeholderStyle}>Não informado</span>
                )}
              </span>
            </div>
          </div> */}
        </div>

        <div style={{ padding: "24px" }}>
          <div className="notice notice--warn" style={{ marginBottom: "32px" }}>
            <i className="bi bi-lock-fill"></i>
            <span>
              O registro é imutável após gravado. Correções devem ser feitas por
              retificação.
            </span>
          </div>

          <div className="split-layout" style={{ alignItems: "stretch" }}>
            <div className="history-col">
              <fieldset
                className="fieldset"
                style={{
                  flex: 1,
                  height: "100%",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: 0,
                }}
              >
                <legend className="legend">Histórico Clínico</legend>
                {historico.length > 0 ? (
                  <div className="history-timeline" style={{ flex: 1 }}>
                    {historico.map((r) => (
                      <div className="timeline-card" key={r.id}>
                        <span className="timeline-date">
                          {r.data_registro}
                        </span>
                        <span className="tag timeline-type">
                          {descricaoPorId(r.tipo_registro_id)}
                        </span>
                        <div className="timeline-content">
                          {r.diagnostico && (
                            <div>
                              <strong>Diagnóstico:</strong> {r.diagnostico}
                            </div>
                          )}
                          {r.sintomas && (
                            <div>
                              <strong>Sintomas:</strong> {r.sintomas}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="empty"
                    style={{
                      flex: 1,
                      padding: "32px 16px",
                      margin: 0,
                      border: "none",
                      background: "transparent",
                    }}
                  >
                    <i
                      className="bi bi-clipboard-x"
                      style={{ fontSize: "24px", marginBottom: "8px" }}
                    ></i>
                    <strong>Sem histórico anterior.</strong>
                  </div>
                )}
              </fieldset>
            </div>

            <div className="form-col">
              <fieldset
                className="fieldset"
                style={{
                  flex: 1,
                  height: "100%",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: 0,
                }}
              >
                <legend className="legend">Novo registro</legend>
                <div className="form-grid">
                  <div className="field">
                    <label className="field-label" htmlFor="consulta_id">
                      Seleciole a Consulta<span className="req">*</span>
                    </label>
                    <select
                      id="consulta_id"
                      name="consulta_id"
                      className="field-select"
                      value={form.consulta_id}
                      onChange={handleChange}
                    >
                      {listConsultas.map((consulta) => (
                        <option key={consulta.value} value={consulta.value}>
                          {consulta.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="tipo_registro_id">
                      Tipo de registro<span className="req">*</span>
                    </label>
                    <select
                      id="tipo_registro_id"
                      name="tipo_registro_id"
                      className="field-select"
                      value={form.tipo_registro_id}
                      onChange={handleChange}
                    >
                      {tipos.map((t) => (
                        <option key={t.id} value={t.id}>
                          {labelTipo(t.descricao)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {mostrarDiagnostico && (
                    <div className="field">
                      <label className="field-label" htmlFor="diagnostico">
                        Diagnóstico<span className="req">*</span>
                      </label>
                      <textarea
                        id="diagnostico"
                        name="diagnostico"
                        rows={3}
                        className="field-textarea"
                        value={form.diagnostico}
                        onChange={handleChange}
                        placeholder="Descreva o diagnóstico…"
                      />
                    </div>
                  )}
                  {mostrarSintomas && (
                    <div className="field">
                      <label className="field-label" htmlFor="sintomas">
                        Sintomas<span className="req">*</span>
                      </label>
                      <textarea
                        id="sintomas"
                        name="sintomas"
                        rows={3}
                        className="field-textarea"
                        value={form.sintomas}
                        onChange={handleChange}
                        placeholder="Descreva os sintomas relatados…"
                      />
                    </div>
                  )}

                  <div className="field">
                    <label className="field-label" htmlFor="observacoes">
                      Observações<span className="req"></span>
                    </label>
                    <textarea
                      id="observacoes"
                      name="observacoes"
                      rows={2}
                      className="field-textarea"
                      value={form.observacoes}
                      onChange={handleChange}
                      placeholder="Descreva a observação…"
                    />
                  </div>

                </div>
              </fieldset>
            </div>
          </div>

          <div
            className="form-actions"
            style={{ marginTop: "32px", paddingTop: "24px" }}
          >
            <button
              className="btn btn--default"
              onClick={() => navigate("/busca")}
            >
              <i className="bi bi-arrow-left"></i> Voltar
            </button>
            <button
              className="btn btn--primary"
              onClick={salvar}
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>{" "}
                  Salvando…
                </>
              ) : (
                <>
                  <i className="bi bi-check2"></i> Gravar registro
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PaginaRegistroCadastro;
