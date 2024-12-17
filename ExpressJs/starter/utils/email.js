/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  //Create TransPort
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER_NAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //Define options
  const mailOptions = {
    from: 'Gopi K <tamizhgopi696@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
module.exports = sendMail;
