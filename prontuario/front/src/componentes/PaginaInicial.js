import { useState } from "react";
import { get } from "../servicos/api";
import { useNavigate } from "react-router-dom";

function PaginaInicial() {
    const [pacienteId, setPacienteId] = useState("");
    const [resultado, setResultado] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    const buscar = async () => {
        if (!pacienteId) {
            alert("Informe o ID do paciente.");
            return;
        }
        setCarregando(true);
        try {
            const dados = await get(`prontuario/paciente/${pacienteId}`);
            setResultado(dados);
        } catch (erro) {
            if (erro.response && erro.response.status === 404) {
                setResultado(null);
                alert("Nenhum prontuário encontrado para este paciente.");
            } else {
                alert("Erro ao buscar prontuário: " + erro.message);
            }
        }
        setCarregando(false);
    };

    const formatarData = (data) => {
        if (!data) return "-";
        return new Date(data).toLocaleString("pt-BR");
    };

    return (
        <div className="container my-5">
            {/* Busca */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3">
                    <h4 className="mb-0 text-primary">
                        <i className="bi bi-search me-2"></i>
                        Consultar Histórico Clínico
                    </h4>
                </div>
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <label className="form-label">ID do Paciente</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Ex: 1"
                                value={pacienteId}
                                onChange={(e) => setPacienteId(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && buscar()}
                            />
                        </div>
                        <div className="col-md-3">
                            <button className="btn btn-primary w-100" onClick={buscar} disabled={carregando}>
                                {carregando
                                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Buscando...</>
                                    : <><i className="bi bi-search me-2"></i>Buscar</>
                                }
                            </button>
                        </div>
                        <div className="col-md-3">
                            <a href="/registro" className="btn btn-success w-100">
                                <i className="bi bi-plus-circle me-2"></i>
                                Novo Registro
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resultado */}
            {resultado && (
                <>
                    <div className="alert alert-info d-flex align-items-center mb-4">
                        <i className="bi bi-person-circle me-2 fs-5"></i>
                        <span>
                            <strong>Prontuário #{resultado.prontuario.id}</strong> —
                            Paciente ID: {resultado.prontuario.paciente_id} —
                            Criado em: {formatarData(resultado.prontuario.data_criacao)}
                        </span>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-primary">
                                <i className="bi bi-journal-text me-2"></i>
                                Registros Clínicos ({resultado.registros.length})
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            {resultado.registros.length === 0 ? (
                                <p className="text-muted text-center p-4">Nenhum registro clínico encontrado.</p>
                            ) : (
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">ID</th>
                                            <th>Data</th>
                                            <th>Tipo</th>
                                            <th>Diagnóstico</th>
                                            <th>Sintomas</th>
                                            <th className="text-center">Situação</th>
                                            <th className="text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultado.registros.map((r) => (
                                            <tr key={r.id}>
                                                <td className="ps-4">{r.id}</td>
                                                <td><small>{formatarData(r.data_registro)}</small></td>
                                                <td>
                                                    <span className="badge bg-secondary">{r.tipo_descricao}</span>
                                                </td>
                                                <td style={{ maxWidth: 200 }}>
                                                    <span className="text-truncate d-block" style={{ maxWidth: 180 }}>{r.diagnostico}</span>
                                                </td>
                                                <td style={{ maxWidth: 180 }}>
                                                    <span className="text-truncate d-block" style={{ maxWidth: 160 }}>{r.sintomas}</span>
                                                </td>
                                                <td className="text-center">
                                                    {r.retificado
                                                        ? <span className="badge bg-warning text-dark"><i className="bi bi-exclamation-triangle me-1"></i>Retificado</span>
                                                        : <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Original</span>
                                                    }
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-warning"
                                                        onClick={() => navigate(`/retificacao/${r.id}`)}
                                                        title="Retificar"
                                                    >
                                                        <i className="bi bi-pencil-square me-1"></i>Retificar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default PaginaInicial;
