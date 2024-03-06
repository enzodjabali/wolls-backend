const Joi = require('@hapi/joi');

// User

const createUserSchema = Joi.object({
    firstname: Joi.string().min(2).max(30).required(),
    lastname: Joi.string().min(2).max(30).required(),
    pseudonym: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({'any.only': 'Passwords do not match'}),
});

const updateUserSchema = Joi.object({
    firstname: Joi.string().min(2).max(30),
    lastname: Joi.string().min(2).max(30),
    pseudonym: Joi.string().min(2).max(30),
    email: Joi.string().email().lowercase(),
    password: Joi.string().min(2),
    confirmPassword: Joi.string().min(2),
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
