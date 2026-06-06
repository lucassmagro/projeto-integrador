import banco from "../Banco.js";
import { DataTypes } from "sequelize";

const RegistroClinico = banco.define(
  "registro_clinico",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    prontuario_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    consulta_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    profissional_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ATIVO",
    },
    data_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    schema: "sistema",
    tableName: "registro_clinico",
  },
);

export default RegistroClinico;
