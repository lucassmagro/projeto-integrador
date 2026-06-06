import banco from "../Banco.js";
import Prontuario from "../models/Prontuario.js";
import RegistroClinico from "../models/RegistroClinico.js";

async function getDiagnostico(registro_id) {
  const [rows] = await banco.query(
    "SELECT descricao FROM sistema.diagnostico WHERE registro_id = :id LIMIT 1",
    { replacements: { id: registro_id } }
  );
  return rows[0]?.descricao || null;
}

async function getSintomas(registro_id) {
  const [rows] = await banco.query(
    "SELECT descricao FROM sistema.sintoma WHERE registro_id = :id LIMIT 1",
    { replacements: { id: registro_id } }
  );
  return rows[0]?.descricao || null;
}

async function buscarPorPaciente(req, res) {
  const paciente_id = req.params.paciente_id;

  const prontuario = await Prontuario.findOne({ where: { paciente_id } });
  if (!prontuario) {
    return res.status(404).json({ mensagem: "Prontuário não encontrado para este paciente." });
  }

  const registros = await RegistroClinico.findAll({
    where: { prontuario_id: prontuario.id },
    order: [["data_registro", "DESC"]],
  });

  const registrosComDados = await Promise.all(registros.map(async (r) => {
    const diagnostico = await getDiagnostico(r.id);
    const sintomas = await getSintomas(r.id);
    return {
      ...r.dataValues,
      diagnostico,
      sintomas,
      tipo_descricao: r.tipo,
      retificado: r.status === "RETIFICADO",
    };
  }));

  return res.json({ prontuario, registros: registrosComDados });
}

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

  const registrosComDados = await Promise.all(registros.map(async (r) => {
    const diagnostico = await getDiagnostico(r.id);
    const sintomas = await getSintomas(r.id);
    return {
      ...r.dataValues,
      diagnostico,
      sintomas,
      tipo_descricao: r.tipo,
      retificado: r.status === "RETIFICADO",
    };
  }));

  return res.json({ prontuario, registros: registrosComDados });
}

export default { buscarPorPaciente, buscarPorId };
