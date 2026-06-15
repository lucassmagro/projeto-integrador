import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config({
    path: './.env',
});

const banco = new Sequelize(process.env.DB_NAME ?? "prontuario", process.env.DB_USER ?? "postgres", process.env.DB_PASS ?? "postgres", {
  host: process.env.DB_HOST ?? "localhost",
  port: process.env.DB_PORT ?? 5432,
  dialect: process.env.DB_DIALECT ?? "postgres",
  define: {
    schema: "sistema",
    timestamps: false,
    freezeTableName: true,
  },
  // Mantém o schema sistema no search_path para a SP e a view acharem as tabelas
  hooks: {
    afterConnect: async (connection) => {
      await connection.query("SET search_path TO sistema, public;");
    },
  },
});



export default banco;
