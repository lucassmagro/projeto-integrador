import RegistroClinico from "../models/RegistroClinico.js";
import Prontuario from "../models/Prontuario.js";
import axios from "axios";

const dadosconsulta =
  { id: 1, paciente_id: 1, medico_id: 1 }


// Função que simula o fetch com 1 segundo de atraso (latência)
export const buscaConsulta = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dadosconsulta);
    }, 1000); // dadosconsulta = 1 segundo
  });
};

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
  const { consulta_id, tipo_registro_id, diagnostico, sintomas, observacoes } = req.body;

  try {

    const consulta = await buscaConsulta()

    if (!consulta) return res.status(422).json({
      mensagem: "Consulta inválida, não encontrada ou cancelada. Não é possível registrar.",
    });

    // Busca ou cria o prontuário do paciente
    let prontuario = await Prontuario.findOne({ where: { paciente_id: consulta.paciente_id } });

    if (!prontuario) {
      prontuario = await Prontuario.create({ paciente_id: consulta.paciente_id });
    }

    // Cria o registro clínico (imutável a partir deste momento)
    const dados = await RegistroClinico.create({
      prontuario_id: prontuario.id,
      consulta_id,
      medico_id: consulta.medico_id,
      tipo_registro_id,
      diagnostico,
      sintomas,
      observacoes,
    });

    return res.status(201).json(dados);

  } catch (erro) {
    return res.status(422).json({
      mensagem: "Não foi possível validar a consulta no módulo G4. Verifique o ID informado.",
    });
  }
}

export default { listar, selecionar, inserir };
