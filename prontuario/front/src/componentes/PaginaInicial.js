import { useState, useEffect } from "react";
import { get } from "../servicos/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { labelTipo } from "../utils/tipoRegistroLabels";

// G1 indisponível, pacientes simulados localmente
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

function PaginaInicial() {
    const [pacienteId, setPacienteId] = useState("");
    const [resultado, setResultado] = useState(null);
    const [tipos, setTipos] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [registroModal, setRegistroModal] = useState(null);
    const [sugestoes, setSugestoes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        get("tipo-registro")
            .then((dados) => setTipos(dados))
            .catch(() => {});
    }, []);

    const descricaoTipo = (id) =>
        labelTipo(tipos.find((t) => String(t.id) === String(id))?.descricao || "-");

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

    const aoDigitar = (valor) => {
        setPacienteId(valor);
        const termo = valor.trim().toLowerCase();
        if (!termo) {
            setSugestoes([]);
            return;
        }
        const ehNumero = /^\d+$/.test(termo);
        const filtrados = PACIENTES_MOCK.filter((p) =>
            ehNumero
                ? String(p.id).startsWith(termo)
                : p.nome.toLowerCase().includes(termo)
        ).slice(0, 5);
        setSugestoes(filtrados);
    };

    const selecionarSugestao = (p) => {
        setPacienteId(String(p.id));
        setSugestoes([]);
    };

    const gerarPDF = () => {
        const janela = window.open('', '_blank');
        if (!janela) {
            toast.error("Permita pop-ups para exportar o PDF.");
            return;
        }
        janela.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Prontuário — Paciente #${resultado.prontuario.paciente_id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px;
                   color: #1a1a1a; font-size: 13px; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .subtitulo { color: #555; margin-bottom: 24px; font-size: 13px; }
            .info-linha { display: flex; gap: 40px; margin-bottom: 24px;
                          border-bottom: 2px solid #1a56db; padding-bottom: 12px; }
            .info-item label { font-weight: bold; display: block;
                               font-size: 11px; color: #555; }
            .info-item span { font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #1a56db; color: white; padding: 8px 12px;
                 text-align: left; font-size: 12px; }
            td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb;
                 font-size: 12px; }
            tr:nth-child(even) td { background: #f8fafc; }
            .badge { display: inline-block; padding: 2px 8px;
                     border-radius: 4px; font-size: 11px; }
            .orig { background: #d1fae5; color: #065f46; }
            .ret { background: #fee2e2; color: #991b1b; }
            .rodape { margin-top: 32px; font-size: 11px; color: #888;
                      border-top: 1px solid #e5e7eb; padding-top: 12px;
                      display: flex; justify-content: space-between; }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div style="margin-bottom: 24px; display: flex;
                      justify-content: space-between; align-items: center;">
            <div>
              <h1>Prontuário Eletrônico — G5</h1>
              <div class="subtitulo">
                Sistema de Saúde Integrado · Projeto Integrador 2026
              </div>
            </div>
            <button class="no-print" onclick="window.print()"
              style="padding: 10px 24px; background: #1a56db; color: white;
                     border: none; border-radius: 6px; cursor: pointer;
                     font-size: 14px; font-weight: bold;">
              🖨️ Imprimir / Salvar PDF
            </button>
          </div>
          <div class="info-linha">
            <div class="info-item">
              <label>PACIENTE</label>
              <span>#${resultado.prontuario.paciente_id}</span>
            </div>
            <div class="info-item">
              <label>PRONTUÁRIO</label>
              <span>#${resultado.prontuario.id}</span>
            </div>
            <div class="info-item">
              <label>ABERTO EM</label>
              <span>${new Date(resultado.prontuario.data_criacao).toLocaleString('pt-BR')}</span>
            </div>
            <div class="info-item">
              <label>TOTAL DE REGISTROS</label>
              <span>${resultado.registros.length}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Reg.</th>
                <th>Data/Hora</th>
                <th>Tipo</th>
                <th>Médico</th>
                <th>Diagnóstico</th>
                <th>Sintomas</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              ${resultado.registros.map(r => `
                <tr>
                  <td>#${r.id}</td>
                  <td>${new Date(r.data_registro).toLocaleString('pt-BR')}</td>
                  <td>${descricaoTipo(r.tipo_registro_id)}</td>
                  <td>#${r.medico_id}</td>
                  <td>${r.diagnostico || '-'}</td>
                  <td>${r.sintomas || '-'}</td>
                  <td><span class="badge ${r.retificado ? 'ret' : 'orig'}">
                    ${r.retificado ? 'Retificado' : 'Original'}
                  </span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="rodape">
            <span>G5 — Prontuário Eletrônico · UNOESC Chapecó</span>
            <span>Gerado em: ${new Date().toLocaleString('pt-BR')}</span>
          </div>
        </body>
        </html>
      `);
        janela.document.close();
        janela.focus();
        // Sem print automático, usuário imprime pelo botão, mais confiável entre navegadores
    };

    return (
        <>
            {/* Overflow visible para o dropdown não ser cortado pelo overflow hidden do .panel */}
            <section className="panel" style={{ overflow: 'visible' }}>
                <div className="panel-head">
                    <div>
                        <div className="panel-title">Consulta de Histórico Clínico</div>
                        <div className="panel-sub">Informe o identificador do paciente para abrir o prontuário.</div>
                    </div>
                </div>
                <div className="panel-body">
                    <div className="toolbar">
                        <div className="field" style={{ position: 'relative' }}>
                            <label className="field-label" htmlFor="pacienteId">Paciente (nome ou ID)</label>
                            <input
                                id="pacienteId"
                                type="text"
                                className="field-input"
                                placeholder="Ex.: João Silva ou 1"
                                value={pacienteId}
                                autoComplete="off"
                                onChange={(e) => aoDigitar(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && buscar()}
                                onBlur={() => setTimeout(() => setSugestoes([]), 150)}
                            />
                            {sugestoes.length > 0 && (
                                <ul
                                    style={{
                                        listStyle: 'none',
                                        margin: '4px 0 0',
                                        padding: '4px',
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 9999,
                                        background: 'white',
                                        border: '1px solid var(--line)',
                                        borderRadius: '6px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                    }}
                                >
                                    {sugestoes.map((p) => (
                                        <li
                                            key={p.id}
                                            onClick={() => selecionarSugestao(p)}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--row-hover, #f1f5f9)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                            style={{
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                color: '#1a1a1a',
                                            }}
                                        >
                                            {p.nome} — ID: {p.id}
                                        </li>
                                    ))}
                                </ul>
                            )}
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

            {resultado && (
                <section className="panel">
                    <div className="clinical-banner" style={{ border: 'none', borderBottom: '1px solid var(--line)', borderRadius: 0, marginBottom: 0 }}>
                        <div className="cb-main">
                            <div className="cb-avatar">P</div>
                            <div className="cb-info">
                                <div className="cb-name">Paciente #{resultado.prontuario.paciente_id}</div>
                                <div className="cb-id">Prontuário #{resultado.prontuario.id}</div>
                            </div>
                        </div>
                        <div className="cb-meta">
                            <div className="cb-meta-item">
                                <span className="cb-meta-label">Aberto em</span>
                                <span className="cb-meta-value">{formatarData(resultado.prontuario.data_criacao)}</span>
                            </div>
                            <div className="cb-meta-item">
                                <span className="cb-meta-label">Registros</span>
                                <span className="cb-meta-value">{resultado.registros.length}</span>
                            </div>
                            <button className="btn btn--default" onClick={gerarPDF}>
                                <i className="bi bi-printer"></i> Exportar PDF
                            </button>
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
                                                <button className="btn--link" onClick={() => setRegistroModal(r)}>
                                                    Visualizar
                                                </button>
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

            {registroModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg" style={{ position: 'relative', zIndex: 1055 }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Registro #{registroModal.id}</h5>
                                <button className="btn-close"
                                    onClick={() => setRegistroModal(null)} />
                            </div>
                            <div className="modal-body">
                                <p><strong>Tipo:</strong> {descricaoTipo(registroModal.tipo_registro_id)}</p>
                                <p><strong>Data/Hora:</strong> {formatarData(registroModal.data_registro)}</p>
                                <p><strong>Médico:</strong> #{registroModal.medico_id}</p>
                                {registroModal.diagnostico &&
                                    <p><strong>Diagnóstico:</strong> {registroModal.diagnostico}</p>}
                                {registroModal.sintomas &&
                                    <p><strong>Sintomas:</strong> {registroModal.sintomas}</p>}
                                {registroModal.observacoes &&
                                    <p><strong>Observações:</strong> {registroModal.observacoes}</p>}
                                <p><strong>Situação:</strong>{" "}
                                    {registroModal.retificado ? "Retificado" : "Original"}
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn--default"
                                    onClick={() => setRegistroModal(null)}>Fechar</button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"
                        style={{ opacity: 0.3 }}
                        onClick={() => setRegistroModal(null)} />
                </div>
            )}
        </>
    );
}

export default PaginaInicial;
