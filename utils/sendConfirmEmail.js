const mailer = require('../mailer/nodemailer');

module.exports.sendConfirmEmail = (data, email) => {
    const message = {
        from: 'admin@test.com',
        to: email,
        subject: 'Подтверждение почты от Platform',
        html: `Для того, чтобы подтвердить почту, перейдите <a href="http://localhost:3000/verify?hash=${data.confirm_hash}">по этой ссылке</a>`,
    };

    return mailer(message);
}