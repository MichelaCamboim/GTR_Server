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
      enum: ["alta", "media", "baixa"],
      default: "media",
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
          if (periodicidade === "unica" || periodicidade === "diaria")
            return true;
          if (periodicidade === "semanal") {
            if (!Array.isArray(v))
              throw new Error("Experava-se uma array aqui.");
            let isOk = v.every((item) => {
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
            if (!isOk)
              throw new Error(
                "Experava-se uma array vazia ou contendo os dias da semana."
              );
            else return true;
          }
          if (periodicidade === "mensal") {
            if (typeof +v !== "number")
              throw new Error("Experava-se um número.");
            if (+v <= 0 || +v >= 32)
              throw new Error("Experava-se um número entre 1 e 31.");
            return true;
          }
          // should never reach here
          return false;
        },
        message: "Erro na validação de detalhesPeriodicidade.",
      },
    },
    inicio: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!dateRegex.test(v) || isNaN(new Date(v).getTime()))
            throw new Error(`Data inválida: ${v}`);
          if (
            new Date(v).toISOString().split("T")[0] !==
            new Date().toISOString().split("T")[0]
          ) {
            throw new Error("A data de início deve ser hoje.");
          }

          return true;
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
        message: "Tempo estimado HH:MM. String informada é inválida: {VALUE}",
      },
    },
    prazoFinal: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!dateRegex.test(v) || isNaN(new Date(v).getTime()))
            throw new Error(`Data inválida: ${v}`);
          if (new Date(v) <= new Date(this.get("inicio")))
            throw new Error(
              "A data de prazo final deve ser maior que a data de início."
            );
          return true;
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
