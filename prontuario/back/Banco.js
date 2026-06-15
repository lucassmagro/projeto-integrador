import { Sequelize } from "sequelize";

const banco = new Sequelize("prontuario", "postgres", "02041329", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
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
