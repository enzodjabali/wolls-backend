const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAILER_USER, // Your OVH email address
        pass: process.env.MAILER_PASS // Your OVH email password
    }
});

const sendEmail = async (email, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.MAILER_USER, // Your OVH email address
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
