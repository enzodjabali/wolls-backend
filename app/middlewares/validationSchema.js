const Joi = require('@hapi/joi');

//////////////////////////////////////////////////////////////////////
//                             User                                 //
//////////////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////////////
//                             Group                                //
//////////////////////////////////////////////////////////////////////

const createGroupSchema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
    description: Joi.string().min(2).max(100)
});

const updateGroupSchema = Joi.object({
    name: Joi.string().min(2).max(30),
    description: Joi.string().min(2).max(100)
});

//////////////////////////////////////////////////////////////////////
//                            Expense                               //
//////////////////////////////////////////////////////////////////////

const createExpenseSchema = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    amount: Joi.number().min(0).required(),
    group_id: Joi.string().required(),
    category: Joi.string().min(2).max(30)
});

const updateExpenseSchema = Joi.object({
    title: Joi.string().min(2).max(100),
    amount: Joi.number().min(0),
    category: Joi.string().min(2).max(30)
});

//////////////////////////////////////////////////////////////////////
//                             Test                                 //
//////////////////////////////////////////////////////////////////////

const createTestSchema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
});

const updateTestSchema = Joi.object({
    name: Joi.string().min(2).max(30),
});

//////////////////////////////////////////////////////////////////////
//                           Exports                                //
//////////////////////////////////////////////////////////////////////

module.exports = {
    // User
    createUserSchema,
    updateUserSchema,
    // Group
    createGroupSchema,
    updateGroupSchema,
    // Expense
    createExpenseSchema,
    updateExpenseSchema,
    // Test
    createTestSchema,
    updateTestSchema,
};
