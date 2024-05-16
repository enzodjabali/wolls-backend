const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Creates a nodemailer transporter object with the provided configuration
 * @type {object}
 */
const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    secure: false,
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS
    }
});

/**
 * Sends an email using the configured email transporter
 * @param {string} email The email address of the recipient
 * @param {string} subject The subject of the email
 * @param {string} text The body text of the email
 * @returns {boolean} Returns true if the email is sent successfully, otherwise false
 */
const sendEmail = async (email, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.MAILER_USER,
            to: email,
            subject: subject,
            text: text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = sendEmail;
