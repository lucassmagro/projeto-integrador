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
            .catch(() => { });
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
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            :root {
              --accent: #0284c7;
              --ink: #0f172a;
              --ink-2: #334155;
              --ink-3: #475569;
              --line: #e2e8f0;
              --line-soft: #f1f5f9;
              --row-head: #f8fafc;
              --row-zebra: #ffffff;
              --ok-fg: #166534;
              --ok-bg: #dcfce7;
              --danger-fg: #991b1b;
              --danger-bg: #fee2e2;
              --info-fg: #0369a1;
              --info-bg: #e0f2fe;
              --info-line: #bae6fd;
            }
            body { 
              font-family: "Inter", sans-serif; 
              padding: 40px;
              color: var(--ink-2); 
              font-size: 14px; 
              background: #fff;
              line-height: 1.5;
            }
            h1 { font-size: 20px; font-weight: 700; color: var(--ink); margin: 0 0 4px 0; letter-spacing: -0.2px; }
            .subtitulo { color: var(--ink-3); margin-bottom: 24px; font-size: 14px; }
            
            .clinical-banner {
              background: var(--row-head);
              border: 1px solid var(--line);
              border-radius: 4px;
              padding: 16px 24px;
              margin-bottom: 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              box-sizing: border-box;
            }
            .cb-main { display: flex; align-items: center; gap: 16px; }
            .cb-avatar {
              width: 48px; height: 48px; background: var(--line); color: var(--ink);
              border-radius: 4px; display: flex; align-items: center; justify-content: center;
              font-size: 20px; font-weight: 600; border: 1px solid var(--line-soft);
            }
            .cb-info { display: flex; flex-direction: column; }
            .cb-name { font-size: 16px; font-weight: 700; color: var(--ink); letter-spacing: -0.2px; }
            .cb-id { font-family: monospace; font-size: 14px; color: var(--ink-3); font-weight: 500; }
            
            .cb-meta { display: flex; gap: 24px; }
            .cb-meta-item { display: flex; flex-direction: column; text-align: right; }
            .cb-meta-label { font-size: 12px; text-transform: uppercase; color: var(--ink-3); font-weight: 600; letter-spacing: 0.5px; }
            .cb-meta-value { font-size: 14px; font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { 
              background: var(--row-head); color: var(--ink-3); padding: 8px 24px;
              text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; 
              letter-spacing: 0.5px; border-bottom: 1px solid var(--line); white-space: nowrap;
            }
            td { padding: 12px 24px; border-bottom: 1px solid var(--line-soft); color: var(--ink-2); vertical-align: middle; }
            tr:nth-child(even) td { background: var(--row-zebra); }
            
            .status {
              display: inline-flex; align-items: center; gap: 6px; font-size: 12px; 
              font-weight: 500; border-radius: 12px; padding: 2px 10px;
            }
            .status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
            .status--orig { color: var(--ok-fg); background: var(--ok-bg); }
            .status--ret { color: var(--danger-fg); background: var(--danger-bg); }
            
            .id-ref { font-family: monospace; font-size: 12px; color: var(--ink-3); background: var(--line-soft); padding: 2px 6px; border-radius: 4px; }
            .tag { 
              display: inline-block; font-size: 11px; font-weight: 600; color: var(--info-fg); 
              background: var(--info-bg); border: 1px solid var(--info-line); 
              border-radius: 12px; padding: 2px 10px; white-space: nowrap; 
            }
            
            .btn-print {
              padding: 10px 24px; background: var(--accent); color: white;
              border: 1px solid var(--accent); border-radius: 4px; cursor: pointer;
              font-size: 14px; font-weight: 600; transition: 0.2s;
            }
            
            .rodape { 
              margin-top: 40px; font-size: 12px; color: var(--ink-3);
              border-top: 1px solid var(--line); padding-top: 16px;
              display: flex; justify-content: space-between; 
            }
            
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
              .clinical-banner { border: none; padding: 0 0 16px 0; border-bottom: 2px solid var(--line); border-radius: 0; background: #fff; }
              th { background: #fff !important; border-bottom: 2px solid var(--line); }
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
            <button class="no-print btn-print" onclick="window.print()">
              Imprimir / Salvar PDF
            </button>
          </div>
          
          <div class="clinical-banner">
            <div class="cb-main">
              <div class="cb-avatar">P</div>
              <div class="cb-info">
                <div class="cb-name">Paciente #${resultado.prontuario.paciente_id}</div>
                <div class="cb-id">Prontuário #${resultado.prontuario.id}</div>
              </div>
            </div>
            <div class="cb-meta">
              <div class="cb-meta-item">
                <span class="cb-meta-label">Aberto em</span>
                <span class="cb-meta-value">${new Date(resultado.prontuario.data_criacao).toLocaleString('pt-BR')}</span>
              </div>
              <div class="cb-meta-item">
                <span class="cb-meta-label">Total de Registros</span>
                <span class="cb-meta-value">${resultado.registros.length}</span>
              </div>
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
                  <td><span class="id-ref">#${r.id}</span></td>
                  <td>${new Date(r.data_registro).toLocaleString('pt-BR')}</td>
                  <td><span class="tag">${descricaoTipo(r.tipo_registro_id)}</span></td>
                  <td><span class="id-ref">#${r.medico_id}</span></td>
                  <td>${r.diagnostico || '-'}</td>
                  <td>${r.sintomas || '-'}</td>
                  <td><span class="status ${r.retificado ? 'status--ret' : 'status--orig'}">
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
                                        <th style={{ width: 100 }}>Ação</th>
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
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                                                    <button className="btn btn--sm btn--default" onClick={() => setRegistroModal(r)} title="Visualizar">
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    <button className="btn btn--sm btn--default" onClick={() => navigate(`/retificacao/${r.id}`)} title="Retificar">
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                </div>
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
