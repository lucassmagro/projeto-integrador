import Prontuario from "../models/Prontuario.js";
import RegistroClinico from "../models/RegistroClinico.js";
import banco from "../Banco.js";
import { QueryTypes } from "sequelize";

async function buscarPorPaciente(req, res) {
  const paciente_id = req.params.paciente_id;

  try {
    const prontuario = await Prontuario.findOne({
      where: { paciente_id }
    });
    if (!prontuario) {
      return res.status(404).json({
        mensagem: "Prontuário não encontrado para este paciente.",
      });
    }

    const registros_clinicos = await banco.query(
      `SELECT * FROM sistema.vw_historico_clinico
       WHERE paciente_id = :paciente_id`,
      {
        replacements: { paciente_id: paciente_id },
        type: QueryTypes.SELECT // Formats output as an array of rows
      }
    );

    return res.json({ prontuario, registros: registros_clinicos });
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
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
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

export default { buscarPorPaciente, buscarPorId };
