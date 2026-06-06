import { Sequelize } from "sequelize";

const banco = new Sequelize("prontuario", "postgres", "02041329", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  define: {
    timestamps: false,
    freezeTableName: true,
  },
});

export default banco;
