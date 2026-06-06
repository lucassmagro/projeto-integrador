import banco from "../Banco.js";
import { DataTypes } from "sequelize";

const TipoRegistro = banco.define(
  "tipo_registro",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    descricao: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    schema: "sistema",
    tableName: "tipo_registro",
  },
);

export default TipoRegistro;
