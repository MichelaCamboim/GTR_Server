import { Schema, model } from "mongoose";

const reportSchema = new Schema(
  {
    avaliado: { type: Schema.Types.ObjectId, ref: "User" },
    avaliador: { type: Schema.Types.ObjectId, ref: "User" },
    refPeriod: {
      type: String,
      enum: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
    year: {
      type: Number,
      default: 2022,
    },

    factors: [
      {
        item: {
          type: String,
          enum: [
            "Communication and delivery of information",
            "Commitment to the organizational's norms and culture",
            "Delivery of results",
            "Individual skills and behaviors",
            "Proactivity",
            "Self-management",
            "Engagement in tasks and activities",
            "Deadline accomplishments",
          ],
        },
        score: { type: Number, min: 0, max: 10 },
        note: { type: String },
      },
    ],

    comments: { type: String },

    reportDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ReportModel = model("Report", reportSchema);

export default ReportModel;
