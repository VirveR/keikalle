const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');
const handlebars = require('handlebars');
const fs = require('fs');

const readHtml = function(filePath, cb) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(error, html) {
        if(error) {
            console.log(error);
        }
        else {
            cb(null, html);
        }
    });
};

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

exports.sendMail = (recipient, sentBy, to, message, artists, date, place, city) => {

    readHtml(__dirname + '/emailTemplates/askUserToEvent.handlebars', function(error, html) {

        if(error) {
            console.log(error);
        }
        var template = handlebars.compile(html);
        var replacements = {
            artists: artists,
            date: date,
            place: place,
            city: city,
            message: message,
            sentBy: sentBy
        };
        var htmlToSend = template(replacements);

        return new Promise((resolve, reject) => {
    
            const email = {
                from: 'keikalle@fribago.com',
                to: recipient,
                subject: `Hei ${to}, ${sentBy} haluaisi lähteä kanssasi keikalle!`,
                html: htmlToSend
            };
        
            transporter.sendMail(email).then(() => {
                resolve(true);
            }).catch((error) => {
                reject(false);
            });
    
        })
    });
  }