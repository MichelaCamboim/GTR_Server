import { Schema, model } from "mongoose";


const avaliacaoSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    periodo_referencia: {
      type: String,
      enum: ["mensal", "trimestral", "semestral", "anual", "outra"],
      default: "mensal",
    },
    dataInicio: {
      type: Date,
      require: "true",
      match:
        /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/,
    },
    dataFim: {
      type: Date,
      require: "true",
      match:
        /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/,
    },
    fatorAvaliado: [
      {
        item: {
          type: String,
          enum: [
            "comunicação",
            "comprometimento com a cultura organizacional e normas estabelecidas",
            "entrega de resultados",
            "comportamento individual",
            "proatividade",
            "autogestão",
            "inteligência emocional",
            "engajamento nas tarefas e atividades",
            "cumprimento de prazos",
          ],
        },
        nota: { type: Number, min: 0, max: 10 },
        observacao: { type: String },
      },
    ],
    observacoes_gerais: { type: String },
    dataAtual: {
        type: Date,
        default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

const AvaliacaoModel = model("Avaliacao", avaliacaoSchema);

export default AvaliacaoModel;
