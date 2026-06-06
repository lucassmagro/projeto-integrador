import Prontuario from "../models/Prontuario.js";
import RegistroClinico from "../models/RegistroClinico.js";

async function buscarPorPaciente(req, res) {
  const paciente_id = req.params.paciente_id;

  try {
    const prontuario = await Prontuario.findOne({ where: { paciente_id } });
    if (!prontuario) {
      return res.status(404).json({ mensagem: "Prontuário não encontrado para este paciente." });
    }

    const registros = await RegistroClinico.findAll({
      where: { prontuario_id: prontuario.id },
      order: [["data_registro", "DESC"]],
    });

    return res.json({ prontuario, registros });
  } catch (erro) {
    console.error("Erro em buscarPorPaciente:", erro);
    return res.status(500).json({ mensagem: erro.message });
  }
}

async function buscarPorId(req, res) {
  const id = req.params.id;

  try {
    const prontuario = await Prontuario.findByPk(id);
    if (!prontuario) {
      return res.status(404).json({ mensagem: "Prontuário não encontrado." });
    }

    const registros = await RegistroClinico.findAll({
      where: { prontuario_id: id },
      order: [["data_registro", "DESC"]],
    });

    return res.json({ prontuario, registros });
  } catch (erro) {
    console.error("Erro em buscarPorId:", erro);
    return res.status(500).json({ mensagem: erro.message });
  }
}

export default { buscarPorPaciente, buscarPorId };
