import RegistroClinico from "../models/RegistroClinico.js";
import TipoRegistro from "../models/TipoRegistro.js";
import banco from "../Banco.js";
import { QueryTypes } from "sequelize";
import Prontuario from "../models/Prontuario.js";
import dotenv from 'dotenv';

dotenv.config({
    path: './.env',
    debug: 'development'
});

const url_g4 = process.env.API_G4
const token_g4 = process.env.TOKEN_G4;


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

//busca demais dados da consulta na api do g4
async function getConsultas(id) {
  try {
    const response = await fetch(url_g4 + `consultations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${token_g4}`
      }
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    const result = await response.json();
    return result
  } catch (error) {
    throw error;
  }
}

// G4 indisponível, dados informados manualmente
async function inserir(req, res) {
  const {
    consulta_id,
    tipo_registro_id,
    diagnostico,
    sintomas,
    observacoes,
  } = req.body;

  if (!consulta_id) {
    return res.status(422).json({
      mensagem: "A consulta é obrigatória.",
    });
  }

  try {

    const dados_consulta = await getConsultas(consulta_id)

    if (!dados_consulta) return res.status(400).json({
      mensagem: "Consulta não encontrada! verifique e tente novamente",
    });

    const tipo_registro = await TipoRegistro.findByPk(tipo_registro_id)

    if (!tipo_registro) return res.status(400).json({
      mensagem: "Tipo de registro não encontrado! verifique e tente novamente",
    });

    let prontuario_id;

    //busca com base no paciente id que vem da consulta (api externa)
    const prontuario = await Prontuario.findOne({ where: { paciente_id: dados_consulta.data.patientId } })
    if (!prontuario) {
      const novo_prontuario = await Prontuario.create({
        paciente_id: dados_consulta.data.patientId
      })
      prontuario_id = novo_prontuario.id
    }
    prontuario_id = prontuario.id;

    const registro = await RegistroClinico.create({
      prontuario_id: prontuario_id,
      consulta_id: consulta_id,
      tipo_registro_id: tipo_registro.id,
      diagnostico:diagnostico,
      sintomas: sintomas,
      observacoes: observacoes,
      retificado: false
    })

    return res
      .status(201)
      .json({ mensagem: "Registro clínico criado com sucesso." });
  } catch (error) {
    return res.status(422).json({
      mensagem:
        "Erro ao criar registro clínico. Verifique os dados e tente novamente.",
    });
  }
}

export default { listar, selecionar, inserir };
