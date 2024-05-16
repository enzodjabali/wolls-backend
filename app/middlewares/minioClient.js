const Minio = require('minio');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Initialize Minio S3 client for interacting with a Minio server
 * @type {Minio.Client} The Minio client object configured with endpoint, port, SSL usage, access key, and secret key
 */
const minioClient = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_S3_USERNAME,
    secretKey: process.env.MINIO_S3_PASSWORD
});

module.exports = minioClient;