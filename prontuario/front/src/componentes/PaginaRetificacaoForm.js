import { useState, useEffect } from "react";
import { get, post } from "../servicos/api";
import { useParams, useNavigate } from "react-router-dom";

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
                alert("Erro ao carregar registro: " + erro.message);
            }
        };
        carregar();
    }, [registro_id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const salvar = async () => {
        if (!form.medico_id || !form.motivo_retificacao || !form.conteudo_anterior || !form.conteudo_novo) {
            alert("Preencha todos os campos obrigatórios.");
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
            alert("Retificação registrada com sucesso!");
            navigate("/");
        } catch (erro) {
            const msg = erro.response?.data?.mensagem || erro.message;
            alert("Erro ao retificar: " + msg);
        }
        setCarregando(false);
    };

    const formatarData = (data) => {
        if (!data) return "-";
        return new Date(data).toLocaleString("pt-BR");
    };

    return (
        <div className="container my-5">
            {registro && (
                <div className="alert alert-secondary mb-4">
                    <strong><i className="bi bi-journal-text me-2"></i>Registro #{registro.id}</strong> —
                    Consulta: {registro.consulta_id} —
                    Data: {formatarData(registro.data_registro)}
                    <div className="mt-2">
                        <small className="text-muted">Diagnóstico original: {registro.diagnostico}</small>
                    </div>
                </div>
            )}

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                    <h4 className="mb-0 text-warning">
                        <i className="bi bi-pencil-square me-2"></i>
                        Nova Retificação
                    </h4>
                </div>
                <div className="card-body">
                    <div className="alert alert-info d-flex align-items-center mb-4">
                        <i className="bi bi-info-circle me-2"></i>
                        <small>O registro original é preservado. A retificação cria uma correção vinculada sem alterar os dados iniciais.</small>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">ID do Médico Responsável <span className="text-danger">*</span></label>
                            <input type="number" className="form-control" name="medico_id" value={form.medico_id} onChange={handleChange} placeholder="Ex: 3" />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label">Motivo da Retificação <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" name="motivo_retificacao" value={form.motivo_retificacao} onChange={handleChange} placeholder="Ex: Erro de digitação no diagnóstico" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Conteúdo Anterior <span className="text-danger">*</span></label>
                            <textarea className="form-control" name="conteudo_anterior" rows={3} value={form.conteudo_anterior} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Conteúdo Correto <span className="text-danger">*</span></label>
                            <textarea className="form-control" name="conteudo_novo" rows={3} value={form.conteudo_novo} onChange={handleChange} placeholder="Informe o conteúdo correto..." />
                        </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                        <button className="btn btn-warning" onClick={salvar} disabled={carregando}>
                            {carregando
                                ? <><span className="spinner-border spinner-border-sm me-2"></span>Salvando...</>
                                : <><i className="bi bi-floppy me-2"></i>Salvar Retificação</>
                            }
                        </button>
                        <a href="/" className="btn btn-outline-secondary">
                            <i className="bi bi-arrow-left me-2"></i>Voltar
                        </a>
                    </div>
                </div>
            </div>

            {/* Histórico de retificações anteriores */}
            {retificacoes.length > 0 && (
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 text-secondary">
                            <i className="bi bi-clock-history me-2"></i>
                            Retificações Anteriores ({retificacoes.length})
                        </h5>
                    </div>
                    <div className="card-body p-0">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">ID</th>
                                    <th>Data</th>
                                    <th>Médico</th>
                                    <th>Motivo</th>
                                    <th>Anterior</th>
                                    <th>Correto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {retificacoes.map((r) => (
                                    <tr key={r.id}>
                                        <td className="ps-4">{r.id}</td>
                                        <td><small>{formatarData(r.data_retificacao)}</small></td>
                                        <td>{r.medico_id}</td>
                                        <td>{r.motivo_retificacao}</td>
                                        <td><span className="text-danger"><del>{r.conteudo_anterior}</del></span></td>
                                        <td><span className="text-success">{r.conteudo_novo}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaginaRetificacaoForm;
