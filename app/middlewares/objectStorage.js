const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure AWS S3
const s3 = new aws.S3({
    endpoint: 'https://ams3.digitaloceanspaces.com',
    accessKeyId: 'DO00HRMBR876ZP6YWPDM',
    secretAccessKey: '+t6EN+DEhGtXunfZCxHcaZLoQQzsd/2Kz9W6Xlc0v98',
    region: 'ams3'
});

const upload = async (content, filename) => {
    try {
        const buffer = Buffer.from(content, 'base64');

        const fileName = `${uuidv4()}${path.extname(filename)}`;
        const params = {
            Bucket: 'dev-wolls-expense-attachments',
            Key: fileName,
            Body: buffer,
            ACL: 'public-read',
            ContentType: 'application/octet-stream'
        };

        await s3.upload(params).promise();
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

module.exports = upload;
