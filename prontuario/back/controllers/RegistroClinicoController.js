import RegistroClinico from "../models/RegistroClinico.js";
import Prontuario from "../models/Prontuario.js";
import axios from "axios";

// URL base do módulo G4 - Consultas
const G4_URL = "http://localhost:3004";

async function listar(req, res) {
  const dados = await RegistroClinico.findAll({
    order: [["data_registro", "DESC"]],
  });
  return res.json(dados);
}

async function selecionar(req, res) {
  const id = req.params.id;
  const dados = await RegistroClinico.findByPk(id);
  if (!dados) {
    return res.status(404).json({ mensagem: "Registro não encontrado." });
  }
  return res.json(dados);
}

async function inserir(req, res) {
  const { paciente_id, consulta_id, medico_id, tipo_registro_id, diagnostico, sintomas, observacoes } = req.body;

  // Valida se a consulta existe e está com status válido no G4
  try {
    const respostaG4 = await axios.get(`${G4_URL}/consulta/${consulta_id}`);
    const consulta = respostaG4.data;

    if (!consulta || consulta.status === "cancelada") {
      return res.status(422).json({
        mensagem: "Consulta inválida, não encontrada ou cancelada. Não é possível registrar.",
      });
    }
  } catch (erro) {
    return res.status(422).json({
      mensagem: "Não foi possível validar a consulta no módulo G4. Verifique o ID informado.",
    });
  }

  // Busca ou cria o prontuário do paciente
  let prontuario = await Prontuario.findOne({ where: { paciente_id: paciente_id } });
  if (!prontuario) {
    prontuario = await Prontuario.create({ paciente_id: paciente_id });
  }

  // Cria o registro clínico (imutável a partir deste momento)
  const dados = await RegistroClinico.create({
    prontuario_id: prontuario.id,
    consulta_id,
    medico_id,
    tipo_registro_id,
    diagnostico,
    sintomas,
    observacoes,
  });

  return res.status(201).json(dados);
}

export default { listar, selecionar, inserir };
