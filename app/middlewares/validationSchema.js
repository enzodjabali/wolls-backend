const Joi = require('@hapi/joi');

//////////////////////////////////////////////////////////////////////
//                             User                                 //
//////////////////////////////////////////////////////////////////////

const createUserSchema = Joi.object({
    firstname: Joi.string().min(2).max(30).required().messages({
        'string.empty': 'Le prénom est requis',
        'string.min': 'Le prénom doit avoir au moins 2 caractères',
        'string.max': 'Le prénom ne peut pas dépasser 2 caractères',
        'any.required': 'Le prénom est requis',
    }),
    lastname: Joi.string().min(2).max(30).required().messages({
        'string.empty': 'Le nom est requis',
        'string.min': 'Le nom doit avoir au moins 2 caractères',
        'string.max': 'Le nom ne peut pas dépasser 2 caractères',
        'any.required': 'Le nom est requis',
    }),
    pseudonym: Joi.string().min(2).max(30).required().messages({
        'string.empty': 'Le pseudo est requis',
        'string.min': 'Le pseudo doit avoir au moins 2 caractères',
        'string.max': 'Le pseudo ne peut pas dépasser 2 caractères',
        'any.required': 'Le pseudo est requis',
    }),
    email: Joi.string().email().lowercase().required().messages({
        'string.empty': 'L\'email est requis',
        'string.email': 'L\'email doit être valide',
        'any.required': 'L\'email est requis',
    }),
    password: Joi.string().min(2).required().messages({
        'string.empty': 'Le mot de passe est requis',
        'string.min': 'Le mot de passe doit avoir au moins 4 caractères',
        'any.required': 'Le mot de passe est requis',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Les mots de passe ne correspondent pas',
        'any.required': 'La confirmation du mot de passe est requise',
    }),
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
