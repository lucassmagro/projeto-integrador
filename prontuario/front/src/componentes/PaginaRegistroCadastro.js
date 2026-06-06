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

            <div className="panel-body">
                <div className="notice notice--warn">
                    <i className="bi bi-lock-fill"></i>
                    <span>O registro é imutável após gravado. Correções devem ser feitas por retificação.</span>
                </div>

                {/* Dados da consulta (somente leitura) */}
                <fieldset className="fieldset">
                    <legend className="legend">Dados da consulta (G4)</legend>
                    <dl className="deflist" style={{ borderTop: "none" }}>
                        <div className="dl-row">
                            <dt>Paciente</dt>
                            <dd><span className="id-ref">#{CONSULTA.paciente_id}</span></dd>
                        </div>
                        <div className="dl-row">
                            <dt>Consulta</dt>
                            <dd><span className="id-ref">#{CONSULTA.id}</span> (origem do registro)</dd>
                        </div>
                        <div className="dl-row">
                            <dt>Médico responsável</dt>
                            <dd><span className="id-ref">#{CONSULTA.medico_id}</span> (G2)</dd>
                        </div>
                    </dl>
                </fieldset>

                {/* Histórico anterior (somente leitura) */}
                {historico.length > 0 && (
                    <fieldset className="fieldset" style={{ padding: 0 }}>
                        <legend className="legend" style={{ margin: "16px 0 0 12px" }}>
                            Registros anteriores ({historico.length})
                        </legend>
                        <div className="table-scroll" style={{ marginTop: 10 }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 70 }}>Reg.</th>
                                        <th style={{ width: 160 }}>Data/hora</th>
                                        <th style={{ width: 200 }}>Tipo</th>
                                        <th>Diagnóstico</th>
                                        <th>Sintomas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historico.map((r) => (
                                        <tr key={r.id}>
                                            <td><span className="id-ref">#{r.id}</span></td>
                                            <td className="num">{formatarData(r.data_registro)}</td>
                                            <td><span className="tag">{descricaoPorId(r.tipo_registro_id)}</span></td>
                                            <td><span className="clip">{r.diagnostico || "-"}</span></td>
                                            <td><span className="clip">{r.sintomas || "-"}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </fieldset>
                )}

                {/* Novo registro (editável) */}
                <fieldset className="fieldset">
                    <legend className="legend">Novo registro</legend>
                    <div className="form-grid">
                        <div className="field field--narrow">
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

                <div className="form-actions">
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
        </section>
    );
}

export default PaginaRegistroCadastro;
