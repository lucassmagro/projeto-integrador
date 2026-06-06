import { useState, useEffect } from "react";
import { post, get } from "../servicos/api";
import { useNavigate } from "react-router-dom";

function PaginaRegistroCadastro() {
    const navigate = useNavigate();
    const [tipos, setTipos] = useState([]);
    const [carregando, setCarregando] = useState(false);

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
                if (dados.length > 0) {
                    setForm((f) => ({ ...f, tipo_registro_id: dados[0].id }));
                }
            } catch (erro) {
                alert("Erro ao carregar tipos de registro.");
            }
        };
        carregarTipos();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const salvar = async () => {
        const { paciente_id, consulta_id, medico_id, tipo_registro_id, diagnostico, sintomas } = form;
        if (!paciente_id || !consulta_id || !medico_id || !tipo_registro_id || !diagnostico || !sintomas) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        setCarregando(true);
        try {
            await post("registro-clinico", {
                ...form,
                paciente_id: Number(paciente_id),
                consulta_id: Number(consulta_id),
                medico_id: Number(medico_id),
                tipo_registro_id: Number(tipo_registro_id),
            });
            alert("Registro clínico salvo com sucesso!");
            navigate("/");
        } catch (erro) {
            const msg = erro.response?.data?.mensagem || erro.message;
            alert("Erro ao salvar: " + msg);
        }
        setCarregando(false);
    };

    return (
        <div className="container my-5">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h4 className="mb-0 text-primary">
                        <i className="bi bi-plus-circle me-2"></i>
                        Novo Registro Clínico
                    </h4>
                </div>
                <div className="card-body">
                    <div className="alert alert-warning d-flex align-items-center mb-4">
                        <i className="bi bi-lock-fill me-2"></i>
                        <small>Após salvo, o registro não poderá ser alterado. Utilize a retificação para correções.</small>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">ID do Paciente <span className="text-danger">*</span></label>
                            <input type="number" className="form-control" name="paciente_id" value={form.paciente_id} onChange={handleChange} placeholder="Ex: 1" />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">ID da Consulta (G4) <span className="text-danger">*</span></label>
                            <input type="number" className="form-control" name="consulta_id" value={form.consulta_id} onChange={handleChange} placeholder="Ex: 10" />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">ID do Médico (G2) <span className="text-danger">*</span></label>
                            <input type="number" className="form-control" name="medico_id" value={form.medico_id} onChange={handleChange} placeholder="Ex: 3" />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Tipo de Registro <span className="text-danger">*</span></label>
                            <select className="form-select" name="tipo_registro_id" value={form.tipo_registro_id} onChange={handleChange}>
                                {tipos.map((t) => (
                                    <option key={t.id} value={t.id}>{t.descricao}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-12">
                            <label className="form-label">Diagnóstico <span className="text-danger">*</span></label>
                            <textarea className="form-control" name="diagnostico" rows={3} value={form.diagnostico} onChange={handleChange} placeholder="Descreva o diagnóstico..." />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label">Sintomas <span className="text-danger">*</span></label>
                            <textarea className="form-control" name="sintomas" rows={3} value={form.sintomas} onChange={handleChange} placeholder="Descreva os sintomas relatados..." />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label">Observações</label>
                            <textarea className="form-control" name="observacoes" rows={2} value={form.observacoes} onChange={handleChange} placeholder="Observações adicionais (opcional)..." />
                        </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                        <button className="btn btn-primary" onClick={salvar} disabled={carregando}>
                            {carregando
                                ? <><span className="spinner-border spinner-border-sm me-2"></span>Salvando...</>
                                : <><i className="bi bi-floppy me-2"></i>Salvar Registro</>
                            }
                        </button>
                        <a href="/" className="btn btn-outline-secondary">
                            <i className="bi bi-arrow-left me-2"></i>Voltar
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaginaRegistroCadastro;
