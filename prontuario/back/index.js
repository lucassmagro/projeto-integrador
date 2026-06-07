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

api.get("/teste", (req, res) => {
  res.send("G5 - API Prontuário funcionando");
});

api.get("/tipo-registro", tipoRegistro.listar);

api.get("/prontuario/paciente/:paciente_id", prontuario.buscarPorPaciente);
api.get("/prontuario/:id", prontuario.buscarPorId);

api.get("/registro-clinico", registroClinico.listar);
api.get("/registro-clinico/:id", registroClinico.selecionar);
api.post("/registro-clinico", registroClinico.inserir);
// Sem PUT/DELETE, registros são imutáveis, correção via POST /retificacao

api.get("/retificacao/registro/:registro_clinico_id", retificacao.listarPorRegistro);
api.post("/retificacao", retificacao.inserir);

api.listen(3005, () => {
  console.log("G5 - API Prontuário rodando na porta 3005...");
});
