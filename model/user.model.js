import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    matricula: {
      type: Number,
      unique: true,
    },
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    admissao: {
      type: Date,
      match:
        /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/,
    },
    foto: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm,
    },
    telefone: {
      type: Number,
      match: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    },
    fusoHorario: { type: Number },
    jornada: { type: Number },
    codUser: { type: Number },
    departamento: {
      type: String,
      trim: true,
    },
    cargo: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Ativo", "Férias", "Licença"],
      default: "Ativo",
    },
    inativo: {
      type: Boolean,
      default: false,
    },
    acesso: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    passwordHash: { type: String, required: true },
    habilidades: [{ type: String }],
    avaliacao: [{ type: Schema.Types.ObjectId, ref: "Avaliacao" }],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", userSchema);

export default UserModel;
