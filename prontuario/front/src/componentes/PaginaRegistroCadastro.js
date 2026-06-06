import { useState, useEffect } from "react";
import { post, get } from "../servicos/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Consulta simulada utilizada pelo backend (G4). Os dados vêm prontos:
// não são solicitados ao usuário, apenas exibidos para visualização.
const CONSULTA = { id: 1, paciente_id: 1, medico_id: 1 };

function PaginaRegistroCadastro() {
    const navigate = useNavigate();
    const [tipos, setTipos] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [carregando, setCarregando] = useState(false);

    const [form, setForm] = useState({
        tipo_registro_id: "",
        diagnostico: "",
        sintomas: "",
        observacoes: "",
    });

    useEffect(() => {
        const carregar = async () => {
            try {
                const dados = await get("tipo-registro");
                setTipos(dados);
                if (dados.length > 0) {
                    setForm((f) => ({ ...f, tipo_registro_id: dados[0].id }));
                }
            } catch (erro) {
                toast.error("Erro ao carregar tipos de registro.");
            }

            try {
                const prontuario = await get(`prontuario/paciente/${CONSULTA.paciente_id}`);
                setHistorico(prontuario.registros || []);
            } catch (erro) {
                // 404 (paciente sem prontuário) ou indisponível: apenas não há histórico.
                setHistorico([]);
            }
        };
        carregar();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const formatarData = (data) => {
        if (!data) return "-";
        return new Date(data).toLocaleString("pt-BR");
    };

    const tipoSelecionado = tipos.find((t) => String(t.id) === String(form.tipo_registro_id));
    const descricaoTipo = tipoSelecionado?.descricao || "";
    const descricaoPorId = (id) =>
        tipos.find((t) => String(t.id) === String(id))?.descricao || id;

    // Exibição dinâmica dos campos conforme o tipo retornado pela API /tipo-registro.
    const mostrarDiagnostico = descricaoTipo === "EVOLUCAO_MEDICA" || descricaoTipo === "EVOLUCAO_ENFERMAGEM";
    const mostrarSintomas =
        descricaoTipo === "EVOLUCAO_MEDICA" ||
        descricaoTipo === "EVOLUCAO_ENFERMAGEM" ||
        descricaoTipo === "ANAMNESE";
    const mostrarObservacoes = descricaoTipo === "OBSERVACAO_ENFERMAGEM";

    const salvar = async () => {
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
                consulta_id: CONSULTA.id,
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
                {/* Banner Clínico da Consulta */}
                <div className="clinical-banner" style={{ border: 'none', borderBottom: '1px solid var(--line)', borderRadius: 0, marginBottom: 0 }}>
                    <div className="cb-main">
                        <div className="cb-avatar">
                            <i className="bi bi-person"></i>
                        </div>
                        <div className="cb-info">
                            <div className="cb-name">Paciente #{CONSULTA.paciente_id}</div>
                            <div className="cb-id">Consulta #{CONSULTA.id}</div>
                        </div>
                    </div>
                    <div className="cb-meta">
                        <div className="cb-meta-item">
                            <span className="cb-meta-label">Médico Responsável</span>
                            <span className="cb-meta-value">#{CONSULTA.medico_id}</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    <div className="notice notice--warn" style={{ marginBottom: '32px' }}>
                        <i className="bi bi-lock-fill"></i>
                        <span>O registro é imutável após gravado. Correções devem ser feitas por retificação.</span>
                    </div>

                    <div className="split-layout">
                    {/* Histórico anterior (somente leitura) */}
                    <div className="history-col">
                        <fieldset className="fieldset" style={{ height: '100%', marginBottom: 0 }}>
                            <legend className="legend">Histórico Clínico</legend>
                            {historico.length > 0 ? (
                                <div className="history-timeline">
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
                                <div className="empty" style={{ padding: '32px 16px', margin: 0, border: 'none', background: 'transparent' }}>
                                    <i className="bi bi-clipboard-x" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
                                    <strong>Sem histórico anterior.</strong>
                                </div>
                            )}
                        </fieldset>
                    </div>

                    {/* Novo registro (editável) */}
                    <div className="form-col">
                        <fieldset className="fieldset" style={{ marginBottom: 0 }}>
                            <legend className="legend">Novo registro</legend>
                            <div className="form-grid">
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
                                            <option key={t.id} value={t.id}>{t.descricao}</option>
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
            </div>
            </div>
        </section>
    );
}

export default PaginaRegistroCadastro;
