import banco from "../Banco.js";
import { DataTypes } from "sequelize";

const Prontuario = banco.define(
  "prontuario",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    paciente_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    schema: "sistema",
    tableName: "prontuario",
  },
);

export default Prontuario;
