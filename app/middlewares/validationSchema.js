const Joi = require('@hapi/joi');

// User

const createUserSchema = Joi.object({
    username: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required(),
});

const updateUserSchema = Joi.object({
    username: Joi.string().min(2).max(30),
    email: Joi.string().email().lowercase(),
    password: Joi.string().min(2),
    role: Joi.string().max(20),
});

// Test

const createTestSchema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
});

const updateTestSchema = Joi.object({
    name: Joi.string().min(2).max(30),
});

module.exports = {
    createUserSchema,
    updateUserSchema,
    createTestSchema,
    updateTestSchema
};