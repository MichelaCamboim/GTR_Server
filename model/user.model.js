import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    matricula: {
      type: Number,
    },
    admissao: {},
    nome: {},
    foto: {},
    email: {},
    telefone: {},
    fusoHorario: {},
    departamento: {},
    cargo: {},
    status: {},
    jornada: {},
    habilidades: {},
    progresso: {},

    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", userSchema);

export default UserModel;
