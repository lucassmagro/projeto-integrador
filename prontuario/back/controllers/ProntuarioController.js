import Prontuario from "../models/Prontuario.js";
import RegistroClinico from "../models/RegistroClinico.js";
import TipoRegistro from "../models/TipoRegistro.js";

// Busca o prontuário de um paciente com todos os registros clínicos
async function buscarPorPaciente(req, res) {
  const paciente_id = req.params.paciente_id;

  const prontuario = await Prontuario.findOne({
    where: { paciente_id: paciente_id },
  });

  if (!prontuario) {
    return res.status(404).json({ mensagem: "Prontuário não encontrado para este paciente." });
  }

  const registros = await RegistroClinico.findAll({
    where: { prontuario_id: prontuario.id },
    order: [["data_registro", "DESC"]],
  });

  const tipos = await TipoRegistro.findAll();
  const tipoMap = {};
  tipos.forEach((t) => (tipoMap[t.id] = t.descricao));

  const registrosComTipo = registros.map((r) => ({
    ...r.dataValues,
    tipo_descricao: tipoMap[r.tipo_registro_id] || "-",
  }));

  return res.json({ prontuario, registros: registrosComTipo });
}

// Busca prontuário por ID do prontuário (usado por módulos externos: G6, G7, G12)
async function buscarPorId(req, res) {
  const id = req.params.id;

  const prontuario = await Prontuario.findByPk(id);
  if (!prontuario) {
    return res.status(404).json({ mensagem: "Prontuário não encontrado." });
  }

  const registros = await RegistroClinico.findAll({
    where: { prontuario_id: id },
    order: [["data_registro", "DESC"]],
  });

  return res.json({ prontuario, registros });
}

export default { buscarPorPaciente, buscarPorId };
