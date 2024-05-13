const Minio = require('minio');
const dotenv = require('dotenv');

dotenv.config();

const minioClient = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_S3_USERNAME,
    secretKey: process.env.MINIO_S3_PASSWORD
});

module.exports = minioClient;