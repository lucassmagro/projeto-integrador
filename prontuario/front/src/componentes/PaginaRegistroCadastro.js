import { useState, useEffect } from "react";
import { post, get } from "../servicos/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { labelTipo } from "../utils/tipoRegistroLabels";

// G1 e G2 indisponíveis, pacientes e médicos simulados localmente
const PACIENTES_MOCK = [
    { id: 1, nome: "João Silva" },
    { id: 2, nome: "Maria Oliveira" },
    { id: 3, nome: "Carlos Souza" },
    { id: 4, nome: "Ana Santos" },
    { id: 5, nome: "Pedro Almeida" },
    { id: 6, nome: "Fernanda Lima" },
    { id: 7, nome: "Roberto Costa" },
    { id: 8, nome: "Juliana Pereira" },
    { id: 9, nome: "Marcos Rodrigues" },
    { id: 10, nome: "Patrícia Ferreira" },
];

const MEDICOS_MOCK = [
    { id: 1, nome: "Dr. Ricardo Mendes" },
    { id: 2, nome: "Dra. Camila Torres" },
    { id: 3, nome: "Dr. Felipe Andrade" },
    { id: 4, nome: "Dra. Beatriz Nunes" },
    { id: 5, nome: "Dr. Henrique Bastos" },
];

function PaginaRegistroCadastro() {
    const navigate = useNavigate();
    const [tipos, setTipos] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [sugestoesPaciente, setSugestoesPaciente] = useState([]);
    const [sugestoesMedico, setSugestoesMedico] = useState([]);

    const [form, setForm] = useState({
        paciente_id: "",
        consulta_id: "",
        medico_id: "",
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

    const carregarHistorico = async (id) => {
        if (!id) { setHistorico([]); return; }
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
                    : item.nome.toLowerCase().includes(termo)
            )
            .slice(0, 5);
    };

    const aoDigitarPaciente = (valor) => {
        setForm((f) => ({ ...f, paciente_id: valor }));
        setSugestoesPaciente(filtrarMock(PACIENTES_MOCK, valor));
    };

    const selecionarPaciente = (p) => {
        setForm((f) => ({ ...f, paciente_id: String(p.id) }));
        setSugestoesPaciente([]);
        carregarHistorico(p.id);
    };

    const aoDigitarMedico = (valor) => {
        setForm((f) => ({ ...f, medico_id: valor }));
        setSugestoesMedico(filtrarMock(MEDICOS_MOCK, valor));
    };

    const selecionarMedico = (m) => {
        setForm((f) => ({ ...f, medico_id: String(m.id) }));
        setSugestoesMedico([]);
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

    const placeholderStyle = { fontStyle: "italic", color: "var(--text-muted, #9ca3af)" };

    const tipoSelecionado = tipos.find((t) => String(t.id) === String(form.tipo_registro_id));
    const descricaoTipo = tipoSelecionado?.descricao || "";
    const descricaoPorId = (id) =>
        labelTipo(tipos.find((t) => String(t.id) === String(id))?.descricao || id);

    // Campos mostrados dependem do tipo de registro
    const mostrarDiagnostico = descricaoTipo === "EVOLUCAO_MEDICA" || descricaoTipo === "EVOLUCAO_ENFERMAGEM";
    const mostrarSintomas =
        descricaoTipo === "EVOLUCAO_MEDICA" ||
        descricaoTipo === "EVOLUCAO_ENFERMAGEM" ||
        descricaoTipo === "ANAMNESE";
    const mostrarObservacoes = descricaoTipo === "OBSERVACAO_ENFERMAGEM";

    const salvar = async () => {
        if (!form.paciente_id || !form.consulta_id || !form.medico_id) {
            toast.warning("Preencha o ID do paciente, da consulta e do médico.");
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
        if (mostrarObservacoes && !form.observacoes) {
            toast.warning("Preencha a observação.");
            return;
        }

        setCarregando(true);
        try {
            await post("registro-clinico", {
                paciente_id: Number(form.paciente_id),
                consulta_id: Number(form.consulta_id),
                medico_id: Number(form.medico_id),
                tipo_registro_id: Number(form.tipo_registro_id),
                diagnostico: mostrarDiagnostico ? form.diagnostico : "",
                sintomas: mostrarSintomas ? form.sintomas : "",
                observacoes: mostrarObservacoes ? form.observacoes : "",
            });
            toast.success("Registro clínico salvo com sucesso!");
            navigate("/busca");
        } catch (erro) {
            const msg = erro.response?.data?.mensagem || erro.message;
            toast.error("Erro ao salvar: " + msg);
        }
        setCarregando(false);
    };

    return (
        <section className="panel">
            <div className="panel-head">
                <div>
                    <div className="panel-title">Novo Registro Clínico</div>
                    <div className="panel-sub">Evolução clínica vinculada à consulta corrente.</div>
                </div>
            </div>

            <div className="panel-body panel-body--flush">
                <div className="clinical-banner" style={{ border: 'none', borderBottom: '1px solid var(--line)', borderRadius: 0, marginBottom: 0 }}>
                    <div className="cb-main">
                        <div className="cb-avatar">
                            <i className="bi bi-person"></i>
                        </div>
                        <div className="cb-info">
                            <div className="cb-name">
                                {form.paciente_id
                                    ? `Paciente #${form.paciente_id}`
                                    : <span style={placeholderStyle}>Informe o ID do paciente</span>}
                            </div>
                            <div className="cb-id">
                                {form.consulta_id
                                    ? `Consulta #${form.consulta_id}`
                                    : <span style={placeholderStyle}>Consulta não informada</span>}
                            </div>
                        </div>
                    </div>
                    <div className="cb-meta">
                        <div className="cb-meta-item">
                            <span className="cb-meta-label">Médico Responsável</span>
                            <span className="cb-meta-value">
                                {form.medico_id
                                    ? `#${form.medico_id}`
                                    : <span style={placeholderStyle}>Não informado</span>}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    <div className="notice notice--warn" style={{ marginBottom: '32px' }}>
                        <i className="bi bi-lock-fill"></i>
                        <span>O registro é imutável após gravado. Correções devem ser feitas por retificação.</span>
                    </div>

                    <div className="split-layout" style={{ alignItems: 'stretch' }}>
                    <div className="history-col">
                        <fieldset className="fieldset" style={{ flex: 1, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
                            <legend className="legend">Histórico Clínico</legend>
                            {historico.length > 0 ? (
                                <div className="history-timeline" style={{ flex: 1 }}>
                                    {historico.map((r) => (
                                        <div className="timeline-card" key={r.id}>
                                            <span className="timeline-date">{formatarData(r.data_registro)}</span>
                                            <span className="tag timeline-type">{descricaoPorId(r.tipo_registro_id)}</span>
                                            <div className="timeline-content">
                                                {r.diagnostico && <div><strong>Diagnóstico:</strong> {r.diagnostico}</div>}
                                                {r.sintomas && <div><strong>Sintomas:</strong> {r.sintomas}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty" style={{ flex: 1, padding: '32px 16px', margin: 0, border: 'none', background: 'transparent' }}>
                                    <i className="bi bi-clipboard-x" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
                                    <strong>Sem histórico anterior.</strong>
                                </div>
                            )}
                        </fieldset>
                    </div>

                    <div className="form-col">
                        <fieldset className="fieldset" style={{ flex: 1, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
                            <legend className="legend">Novo registro</legend>
                            <div className="form-grid">
                                <div className="field" style={{ position: 'relative' }}>
                                    <label className="field-label" htmlFor="paciente_id">
                                        Paciente (nome ou ID)<span className="req">*</span>
                                    </label>
                                    <input
                                        id="paciente_id"
                                        name="paciente_id"
                                        type="text"
                                        className="field-input"
                                        placeholder="Ex.: João Silva ou 1"
                                        autoComplete="off"
                                        value={form.paciente_id}
                                        onChange={(e) => aoDigitarPaciente(e.target.value)}
                                        onBlur={(e) => {
                                            const valor = e.target.value;
                                            setTimeout(() => setSugestoesPaciente([]), 150);
                                            carregarHistorico(valor);
                                        }}
                                    />
                                    {sugestoesPaciente.length > 0 && (
                                        <ul style={dropdownStyle}>
                                            {sugestoesPaciente.map((p) => (
                                                <li
                                                    key={p.id}
                                                    onClick={() => selecionarPaciente(p)}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--row-hover, #f1f5f9)')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                                    style={dropdownItemStyle}
                                                >
                                                    {p.nome} — ID: {p.id}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="field">
                                    <label className="field-label" htmlFor="consulta_id">
                                        ID da Consulta<span className="req">*</span>
                                    </label>
                                    <input
                                        id="consulta_id"
                                        name="consulta_id"
                                        type="number"
                                        min="1"
                                        className="field-input"
                                        value={form.consulta_id}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="field" style={{ position: 'relative' }}>
                                    <label className="field-label" htmlFor="medico_id">
                                        Médico Responsável (nome ou ID)<span className="req">*</span>
                                    </label>
                                    <input
                                        id="medico_id"
                                        name="medico_id"
                                        type="text"
                                        className="field-input"
                                        placeholder="Ex.: Dr. Ricardo Mendes ou 1"
                                        autoComplete="off"
                                        value={form.medico_id}
                                        onChange={(e) => aoDigitarMedico(e.target.value)}
                                        onBlur={() => setTimeout(() => setSugestoesMedico([]), 150)}
                                    />
                                    {sugestoesMedico.length > 0 && (
                                        <ul style={dropdownStyle}>
                                            {sugestoesMedico.map((m) => (
                                                <li
                                                    key={m.id}
                                                    onClick={() => selecionarMedico(m)}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--row-hover, #f1f5f9)')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                                    style={dropdownItemStyle}
                                                >
                                                    {m.nome} — ID: {m.id}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
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
                                            <option key={t.id} value={t.id}>{labelTipo(t.descricao)}</option>
                                        ))}
                                    </select>
                                </div>

                                {mostrarDiagnostico && (
                                    <div className="field">
                                        <label className="field-label" htmlFor="diagnostico">Diagnóstico<span className="req">*</span></label>
                                        <textarea id="diagnostico" name="diagnostico" rows={3} className="field-textarea"
                                            value={form.diagnostico} onChange={handleChange} placeholder="Descreva o diagnóstico…" />
                                    </div>
                                )}
                                {mostrarSintomas && (
                                    <div className="field">
                                        <label className="field-label" htmlFor="sintomas">Sintomas<span className="req">*</span></label>
                                        <textarea id="sintomas" name="sintomas" rows={3} className="field-textarea"
                                            value={form.sintomas} onChange={handleChange} placeholder="Descreva os sintomas relatados…" />
                                    </div>
                                )}
                                {mostrarObservacoes && (
                                    <div className="field">
                                        <label className="field-label" htmlFor="observacoes">Observações<span className="req">*</span></label>
                                        <textarea id="observacoes" name="observacoes" rows={2} className="field-textarea"
                                            value={form.observacoes} onChange={handleChange} placeholder="Descreva a observação…" />
                                    </div>
                                )}
                            </div>
                        </fieldset>
                    </div>
                </div>

                    <div className="form-actions" style={{ marginTop: '32px', paddingTop: '24px' }}>
                        <button className="btn btn--default" onClick={() => navigate("/busca")}>
                            <i className="bi bi-arrow-left"></i> Voltar
                        </button>
                        <button className="btn btn--primary" onClick={salvar} disabled={carregando}>
                            {carregando
                                ? <><span className="spinner-border spinner-border-sm"></span> Salvando…</>
                                : <><i className="bi bi-check2"></i> Gravar registro</>}
                        </button>
                    </div>
            </div>
            </div>
        </section>
    );
}

export default PaginaRegistroCadastro;
