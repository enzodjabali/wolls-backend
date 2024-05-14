const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const APP = express();
const PORT = process.env.APP_PORT;
const DB_URI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mongo/?retryWrites=true&w=majority`;

const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const groupMembershipsRoutes = require('./routes/groupMembershipsRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const refundRoutes = require('./routes/refundRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const messageRoutes = require('./routes/messageRoutes');

APP.use(express.json());

mongoose.connect(DB_URI)
    .then((result) => console.log('Successfully connected to the database!'))
    .catch((err) => console.log(err));

APP.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

// this disables CORS
APP.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    next();
});

APP.use('/v1/users', userRoutes);
APP.use('/v1/groups', groupRoutes);
APP.use('/v1/groups/memberships', groupMembershipsRoutes);
APP.use('/v1/expenses', expenseRoutes);
APP.use('/v1/refunds', refundRoutes);
APP.use('/v1/balances', balanceRoutes);
APP.use('/v1/messages', messageRoutes);

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
APP.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
