import banco from "../Banco.js";
import { DataTypes } from "sequelize";

const RetificacaoRegistro = banco.define(
  "retificacao_registro",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    registro_clinico_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    medico_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    motivo_retificacao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    conteudo_anterior: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    conteudo_novo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data_retificacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    schema: "sistema",
    tableName: "retificacao_registro",
  },
);

export default RetificacaoRegistro;
