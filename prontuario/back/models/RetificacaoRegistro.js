import banco from "../Banco.js";
import { DataTypes } from "sequelize";

const RetificacaoRegistro = banco.define(
  "retificacao",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    registro_original_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    registro_corrigido_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    profissional_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING(500),
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
    tableName: "retificacao",
  },
);

export default RetificacaoRegistro;
