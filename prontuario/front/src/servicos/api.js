import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3005/",
});

export const get = async (rota) => {
  try {
    const resposta = await api.get(rota);
    return resposta.data;
  } catch (erro) {
    console.log(erro);
    throw erro;
  }
};

export const post = async (rota, objeto) => {
  try {
    const resposta = await api.post(rota, objeto);
    return resposta.data;
  } catch (erro) {
    throw erro;
  }
};

export const del = async (rota) => {
  try {
    const resposta = await api.delete(rota);
    return resposta.data;
  } catch (erro) {
    throw erro;
  }
};

export const put = async (rota, objeto) => {
  try {
    const resposta = await api.put(rota, objeto);
    return resposta.data;
  } catch (erro) {
    throw erro;
  }
};
