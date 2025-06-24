const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'proiectfosa@gmail.com',
    pass: 'wdhb gtac lghh xcwf'
  }
});

function sendRegisterEmail(to, username) {
  const subject = 'Bun venit la FoSA!';
  const html = `<p>Bun venit, <b>${username}</b>! Contul tău a fost creat cu succes.</p>
  <p>Ne bucuram sa te avem alaturi!!</p>`;

  return transporter.sendMail({
    from: '"FoSA" <proiectfosa@gmail.com>',
    to,
    subject,
    html
  });
}

module.exports = { sendRegisterEmail };