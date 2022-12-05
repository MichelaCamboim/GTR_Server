import { Schema, model } from "mongoose";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const taskSchema = new Schema(
  {
    // required
    nome: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
    },
    descrição: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["encaminhada", "aceita", "rejeitada", "ativo", "concluida"],
      default: "encaminhada",
    },

    // optional
    prioridade: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["alta", "média", "baixa"],
      default: "média",
    },
    periodicidade: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["unica", "diaria", "semanal", "mensal"],
      default: "unica",
    },
    detalhesPeriodicidade: {
      type: Schema.Types.Mixed,
      validate: {
        validator: function (v) {
          let periodicidade = this.get("periodicidade").trim().toLowerCase();
          if (periodicidade === "unica" && periodicidade === "diaria")
            return true;
          if (periodicidade === "semanal" && Array.isArray(v)) {
            return v.every((item) => {
              return (
                typeof item === "string" &&
                item.trim().toLowerCase() in
                  {
                    domingo: 1,
                    segunda: 1,
                    terça: 1,
                    quarta: 1,
                    quinta: 1,
                    sexta: 1,
                    sabado: 1,
                  }
              );
            });
          }
          if (periodicidade === "mensal" && typeof +v === "number") {
            return +v > 0 && +v < 32;
          }
        },
      },
    },
    inicio: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!dateRegex.test(v) || isNaN(new Date(v).getTime())) return false;
          return new Date(v).toDateString() === new Date().toDateString();
        },
      },
      default: () => new Date().toISOString().split("T")[0],
    },
    tempoestimado: {
      type: String,
      trim: true,
      validate: {
        validator: (v) =>
          /^(?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9])$/.test(v),
      },
    },
    prazoFinal: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!dateRegex.test(v) || isNaN(new Date(v).getTime())) return false;
          return new Date(v) > new Date(this.get("inicio"));
        },
      },
      default: () => new Date().toISOString().split("T")[0],
    },

    // not required
    membros: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [String],
    Referencia: String,
  },
  {
    timestamps: true,
  }
);

const TaskModel = model("Task", taskSchema);

export default TaskModel;
