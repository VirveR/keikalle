const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');

const transporter = nodemailer.createTransport(smtpTransport({
    host:'smtp.hostinger.com',
    secureConnection: false,
    tls: {
      rejectUnauthorized: false
    },
    port: 465,
    auth: {
        user: process.env.EMAILSEND,
        pass: process.env.EMAILPASS,
  }
}));

exports.sendMail = (recipient, sentBy, to, message) => {

    return new Promise((resolve, reject) => {
  
      const email = {
        from: 'keikalle@fribago.com',
        to: recipient,
        subject: `Hei ${to}, ${sentBy} haluaisi lähteä kanssasi keikalle!`,
        text: message
      };
  
      transporter.sendMail(email).then(() => {
        resolve(true);
      }).catch((error) => {
        reject(false);
      });
  
    })
  
  }