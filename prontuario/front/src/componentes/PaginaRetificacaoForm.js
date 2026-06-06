import { useState, useEffect } from "react";
import { get, post } from "../servicos/api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function PaginaRetificacaoForm() {
    const { registro_id } = useParams();
    const navigate = useNavigate();
    const [registro, setRegistro] = useState(null);
    const [retificacoes, setRetificacoes] = useState([]);
    const [carregando, setCarregando] = useState(false);

    const [form, setForm] = useState({
        medico_id: "",
        motivo_retificacao: "",
        conteudo_anterior: "",
        conteudo_novo: "",
    });

    useEffect(() => {
        const carregar = async () => {
            try {
                const reg = await get(`registro-clinico/${registro_id}`);
                setRegistro(reg);
                setForm((f) => ({ ...f, conteudo_anterior: reg.diagnostico }));

                const rets = await get(`retificacao/registro/${registro_id}`);
                setRetificacoes(rets);
            } catch (erro) {
                toast.error("Erro ao carregar registro: " + erro.message);
            }
        };
        carregar();
    }, [registro_id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const salvar = async () => {
        if (!form.medico_id || !form.motivo_retificacao || !form.conteudo_anterior || !form.conteudo_novo) {
            toast.warning("Preencha todos os campos obrigatórios.");
            return;
        }

        setCarregando(true);
        try {
            await post("retificacao", {
                registro_clinico_id: Number(registro_id),
                medico_id: Number(form.medico_id),
                motivo_retificacao: form.motivo_retificacao,
                conteudo_anterior: form.conteudo_anterior,
                conteudo_novo: form.conteudo_novo,
            });
            toast.success("Retificação registrada com sucesso!");
            navigate("/busca");
        } catch (erro) {
            const msg = erro.response?.data?.mensagem || erro.message;
            toast.error("Erro ao retificar: " + msg);
        }
        setCarregando(false);
    };

    const formatarData = (data) => {
        if (!data) return "-";
        return new Date(data).toLocaleString("pt-BR");
    };

    return (
        <>
            <section className="panel">
                <div className="panel-head">
                    <div>
                        <div className="panel-title">Retificação de Registro</div>
                        <div className="panel-sub">Correção vinculada que preserva o registro original.</div>
                    </div>
                </div>

                <div className="panel-body">
                    {/* Registro de referência (somente leitura) */}
                    {registro && (
                        <div className="record-block">
                            <div className="record-block-head">
                                <span className="rb-id">Registro #{registro.id}</span>
                                <span><span className="rb-k">Consulta: </span><span className="rb-v">#{registro.consulta_id}</span></span>
                                <span><span className="rb-k">Médico: </span><span className="rb-v">#{registro.medico_id}</span></span>
                                <span><span className="rb-k">Data: </span><span className="rb-v">{formatarData(registro.data_registro)}</span></span>
                            </div>
                            <div className="record-block-body">
                                <div className="rb-orig-label">Diagnóstico original</div>
                                {registro.diagnostico || "-"}
                            </div>
                        </div>
                    )}

                    <div className="notice notice--info">
                        <i className="bi bi-info-circle"></i>
                        <span>O registro original é preservado. A retificação cria uma correção vinculada, com trilha de auditoria.</span>
                    </div>

                    <fieldset className="fieldset">
                        <legend className="legend">Dados da retificação</legend>
                        <div className="form-grid">
                            <div className="field field--narrow">
                                <label className="field-label" htmlFor="medico_id">ID do médico responsável<span className="req">*</span></label>
                                <input id="medico_id" type="number" name="medico_id" className="field-input"
                                    value={form.medico_id} onChange={handleChange} placeholder="Ex.: 3" />
                            </div>
                            <div className="field">
                                <label className="field-label" htmlFor="motivo_retificacao">Motivo da retificação<span className="req">*</span></label>
                                <input id="motivo_retificacao" type="text" name="motivo_retificacao" className="field-input"
                                    value={form.motivo_retificacao} onChange={handleChange} placeholder="Ex.: Erro de digitação no diagnóstico" />
                            </div>
                            <div className="form-grid form-grid--2">
                                <div className="field">
                                    <label className="field-label" htmlFor="conteudo_anterior">Conteúdo anterior</label>
                                    <textarea id="conteudo_anterior" name="conteudo_anterior" rows={3} className="field-textarea"
                                        value={form.conteudo_anterior} readOnly />
                                    <span className="field-help">Preenchido a partir do registro original.</span>
                                </div>
                                <div className="field">
                                    <label className="field-label" htmlFor="conteudo_novo">Conteúdo correto<span className="req">*</span></label>
                                    <textarea id="conteudo_novo" name="conteudo_novo" rows={3} className="field-textarea"
                                        value={form.conteudo_novo} onChange={handleChange} placeholder="Informe o conteúdo correto…" />
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    <div className="form-actions">
                        <button className="btn btn--default" onClick={() => navigate("/busca")}>
                            <i className="bi bi-arrow-left"></i> Voltar
                        </button>
                        <button className="btn btn--primary" onClick={salvar} disabled={carregando}>
                            {carregando
                                ? <><span className="spinner-border spinner-border-sm"></span> Salvando…</>
                                : <><i className="bi bi-check2"></i> Gravar retificação</>}
                        </button>
                    </div>
                </div>
            </section>

            {/* Histórico de retificações anteriores */}
            {retificacoes.length > 0 && (
                <section className="panel">
                    <div className="panel-head">
                        <div>
                            <div className="panel-title">Retificações anteriores ({retificacoes.length})</div>
                            <div className="panel-sub">Trilha de auditoria deste registro.</div>
                        </div>
                    </div>
                    <div className="panel-body panel-body--flush">
                        <div className="table-scroll">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 70 }}>ID</th>
                                        <th style={{ width: 160 }}>Data/hora</th>
                                        <th style={{ width: 80 }}>Médico</th>
                                        <th style={{ width: "26%" }}>Motivo</th>
                                        <th>Anterior</th>
                                        <th>Correto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {retificacoes.map((r) => (
                                        <tr key={r.id}>
                                            <td><span className="id-ref">#{r.id}</span></td>
                                            <td className="num">{formatarData(r.data_retificacao)}</td>
                                            <td><span className="id-ref">#{r.medico_id}</span></td>
                                            <td className="muted">{r.motivo_retificacao}</td>
                                            <td><span className="diff-old"><del>{r.conteudo_anterior}</del></span></td>
                                            <td><span className="diff-new">{r.conteudo_novo}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

export default PaginaRetificacaoForm;
