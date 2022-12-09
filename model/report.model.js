import { Schema, model } from "mongoose";

const reportSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
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
    startDate: {
      type: Date,
      require: "true",
      match:
        /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/,
    },
    endDate: {
      type: Date,
      require: "true",
      match:
        /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/,
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
