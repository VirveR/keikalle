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
/*
const mailOptions = {
    from: 'keikalle@fribago.com',
    to: 'anttimutanen@gmail.com',
    subject: 'Hello from Nodemailer',
    text: 'This is a test email sent using Nodemailer.'
};

const sendMail = transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
    console.log('Error:', error);
    } else {
    console.log('Email sent:', info.response);
    }
});*/

exports.sendMail = (recipient, message) => {

    return new Promise((resolve, reject) => {
  
      const email = {
        from: 'keikalle@fribago.com',
        to: recipient,
        subject: 'Joku haluaisi lähteä kanssasi keikalle',
        text: message
      };
  
      transporter.sendMail(email).then(() => {
        resolve(true);
      }).catch((error) => {
        reject(false);
      });
  
    })
  
  }