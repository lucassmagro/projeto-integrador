import { useState, useEffect } from "react";
import { get } from "../servicos/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function PaginaInicial() {
    const [pacienteId, setPacienteId] = useState("");
    const [resultado, setResultado] = useState(null);
    const [tipos, setTipos] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        get("tipo-registro")
            .then((dados) => setTipos(dados))
            .catch(() => {});
    }, []);

    const descricaoTipo = (id) =>
        tipos.find((t) => String(t.id) === String(id))?.descricao || "-";

    const buscar = async () => {
        if (!pacienteId) {
            toast.warning("Informe o ID do paciente.");
            return;
        }
        setCarregando(true);
        try {
            const dados = await get(`prontuario/paciente/${pacienteId}`);
            setResultado(dados);
        } catch (erro) {
            if (erro.response && erro.response.status === 404) {
                setResultado(null);
                toast.info("Nenhum prontuário encontrado para este paciente.");
            } else {
                toast.error("Erro ao buscar prontuário: " + erro.message);
            }
        }
        setCarregando(false);
    };

    const formatarData = (data) => {
        if (!data) return "-";
        return new Date(data).toLocaleString("pt-BR");
    };

    return (
        <>
            {/* Busca */}
            <section className="panel">
                <div className="panel-head">
                    <div>
                        <div className="panel-title">Consulta de Histórico Clínico</div>
                        <div className="panel-sub">Informe o identificador do paciente para abrir o prontuário.</div>
                    </div>
                </div>
                <div className="panel-body">
                    <div className="toolbar">
                        <div className="field">
                            <label className="field-label" htmlFor="pacienteId">ID do paciente</label>
                            <input
                                id="pacienteId"
                                type="number"
                                className="field-input"
                                placeholder="Ex.: 1"
                                value={pacienteId}
                                onChange={(e) => setPacienteId(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && buscar()}
                            />
                        </div>
                        <button className="btn btn--primary" onClick={buscar} disabled={carregando}>
                            {carregando
                                ? <><span className="spinner-border spinner-border-sm"></span> Buscando…</>
                                : <><i className="bi bi-search"></i> Buscar</>}
                        </button>
                        <button className="btn btn--default" onClick={() => navigate("/registro")}>
                            <i className="bi bi-file-earmark-plus"></i> Novo registro
                        </button>
                    </div>
                </div>
            </section>

            {/* Resultado */}
            {resultado && (
                <section className="panel">
                    {/* Cabeçalho de paciente */}
                    <div className="patient-bar">
                        <div className="patient-id">
                            Prontuário <span className="pid-num">#{resultado.prontuario.id}</span>
                        </div>
                        <div className="patient-attrs">
                            <div className="attr">
                                <span className="attr-k">Paciente</span>
                                <span className="attr-v">#{resultado.prontuario.paciente_id}</span>
                            </div>
                            <div className="attr">
                                <span className="attr-k">Aberto em</span>
                                <span className="attr-v">{formatarData(resultado.prontuario.data_criacao)}</span>
                            </div>
                            <div className="attr">
                                <span className="attr-k">Registros</span>
                                <span className="attr-v">{resultado.registros.length}</span>
                            </div>
                        </div>
                    </div>

                    {resultado.registros.length === 0 ? (
                        <div className="empty">
                            <i className="bi bi-clipboard-x"></i>
                            <strong>Nenhum registro clínico neste prontuário.</strong>
                            <span>Os registros aparecem aqui assim que forem gravados.</span>
                        </div>
                    ) : (
                        <div className="table-scroll">
                            <table className="data-table">
                                <caption style={{ padding: "12px 14px 8px" }}>
                                    Registros em ordem cronológica, mais recentes primeiro.
                                </caption>
                                <thead>
                                    <tr>
                                        <th style={{ width: 70 }}>Reg.</th>
                                        <th style={{ width: 160 }}>Data/hora</th>
                                        <th style={{ width: 200 }}>Tipo</th>
                                        <th style={{ width: 80 }}>Médico</th>
                                        <th>Diagnóstico</th>
                                        <th>Sintomas</th>
                                        <th style={{ width: 110 }}>Situação</th>
                                        <th className="col-r" style={{ width: 100 }}>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultado.registros.map((r) => (
                                        <tr key={r.id}>
                                            <td><span className="id-ref">#{r.id}</span></td>
                                            <td className="num">{formatarData(r.data_registro)}</td>
                                            <td><span className="tag">{descricaoTipo(r.tipo_registro_id)}</span></td>
                                            <td><span className="id-ref">#{r.medico_id}</span></td>
                                            <td><span className="clip">{r.diagnostico || "-"}</span></td>
                                            <td><span className="clip">{r.sintomas || "-"}</span></td>
                                            <td>
                                                {r.retificado
                                                    ? <span className="status status--ret">Retificado</span>
                                                    : <span className="status status--orig">Original</span>}
                                            </td>
                                            <td className="col-r">
                                                <button className="btn--link" onClick={() => navigate(`/retificacao/${r.id}`)}>
                                                    Retificar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </>
    );
}

export default PaginaInicial;
