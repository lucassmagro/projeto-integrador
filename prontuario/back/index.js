import Express from "express";
import cors from "cors";
import banco from "./Banco.js";
import tipoRegistro from "./controllers/TipoRegistroController.js";
import prontuario from "./controllers/ProntuarioController.js";
import registroClinico from "./controllers/RegistroClinicoController.js";
import retificacao from "./controllers/RetificacaoController.js";

try {
  await banco.authenticate();
  console.log("Banco conectado com sucesso.");
} catch (error) {
  console.error("Erro ao conectar com o banco de dados:", error);
}

const api = Express();
api.use(Express.json());
api.use(cors());

api.get("/", (req, res) => {
  res.send("G5 - API Prontuário funcionando");
});
//listar tipos de registro
api.get("/tipo-registro", tipoRegistro.listar);
//rotas prontuario
api.get("/prontuario/paciente/:paciente_id", prontuario.buscarPorPaciente);
api.get("/prontuario/:id", prontuario.buscarPorId);
//rotas registros clinicos
api.get("/registro-clinico", registroClinico.listar);
api.get("/registro-clinico/:id", registroClinico.selecionar);
api.post("/registro-clinico", registroClinico.inserir);
//rotas retificacao de registros
api.get(
  "/retificacao/registro/:registro_clinico_id",
  retificacao.listarPorRegistro,
);
api.post("/retificacao", retificacao.inserir);

api.listen(3005, () => {
  console.log("G5 - API Prontuário rodando na porta 3005...");
});
