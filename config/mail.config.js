import nodemailer from "nodemailer";

export default nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    secure: false,
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

