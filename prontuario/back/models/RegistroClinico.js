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
      type: DataTypes.UUID,
      allowNull: false,
    },
    medico_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    tipo_registro_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    diagnostico: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sintomas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    retificado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    schema: "sistema",
    tableName: "registro_clinico",
  },
);

export default RegistroClinico;
