const Joi = require('@hapi/joi');
const LOCALE = require('../locales/en-EN');

//////////////////////////////////////////////////////////////////////
//                             User                                 //
//////////////////////////////////////////////////////////////////////

const createUserSchema = Joi.object({
    firstname: Joi.string().min(2).max(15).regex(/^[a-zA-Z]+$/).required().messages({
        'string.empty': LOCALE.firstNameRequired,
        'string.min': LOCALE.firstNameTooShort,
        'string.max': LOCALE.firstNameTooLong,
        'any.required': LOCALE.firstNameRequired,
        'string.pattern.base': LOCALE.invalidRegexFirstname
    }),
    lastname: Joi.string().min(2).max(15).regex(/^[a-zA-Z]+$/).required().messages({
        'string.empty': LOCALE.lastNameRequired,
        'string.min': LOCALE.lastNameTooShort,
        'string.max': LOCALE.lastNameTooLong,
        'any.required': LOCALE.lastNameRequired,
        'string.pattern.base': LOCALE.invalidRegexLastname
    }),
    pseudonym: Joi.string().min(2).max(15).regex(/^[a-zA-Z0-9-_]+$/).required().messages({
        'string.empty': LOCALE.pseudonymRequired,
        'string.min': LOCALE.pseudonymTooShort,
        'string.max': LOCALE.pseudonymTooLong,
        'any.required': LOCALE.pseudonymRequired,
        'string.pattern.base': LOCALE.invalidRegexPseudonym
    }),
    email: Joi.string().email().lowercase().required().messages({
        'string.empty': LOCALE.emailRequired,
        'string.email': LOCALE.invalidEmail,
        'any.required': LOCALE.emailRequired,
    }),
    password: Joi.string().min(8).required().messages({
        'string.empty': LOCALE.passwordRequired,
        'string.min': LOCALE.passwordTooShort,
        'any.required': LOCALE.passwordTooLong,
    }),
    confirmPassword: Joi.string().min(8).valid(Joi.ref('password')).required().messages({
        'string.min': LOCALE.passwordTooShort,
        'any.only': LOCALE.passwordsNotMatching,
        'any.required': LOCALE.passwordRequired,
    }),
});

const updateUserSchema = Joi.object({
    firstname: Joi.string().min(2).max(15).regex(/^[a-zA-Z]+$/).messages({
        'string.empty': LOCALE.firstNameRequired,
        'string.min': LOCALE.firstNameTooShort,
        'string.max': LOCALE.firstNameTooLong,
        'string.pattern.base': LOCALE.invalidRegexFirstname
    }),
    lastname: Joi.string().min(2).max(15).regex(/^[a-zA-Z]+$/).messages({
        'string.empty': LOCALE.lastNameRequired,
        'string.min': LOCALE.lastNameTooShort,
        'string.max': LOCALE.lastNameTooLong,
        'string.pattern.base': LOCALE.invalidRegexLastname
    }),
    pseudonym: Joi.string().min(2).max(15).regex(/^[a-zA-Z0-9-_]+$/).messages({
        'string.empty': LOCALE.pseudonymRequired,
        'string.min': LOCALE.pseudonymTooShort,
        'string.max': LOCALE.pseudonymTooLong,
        'string.pattern.base': LOCALE.invalidRegexPseudonym
    }),
    email: Joi.string().email().lowercase().messages({
        'string.empty': LOCALE.emailRequired,
        'string.email': LOCALE.invalidEmail,
    }),
    emailPaypal: Joi.string().email().lowercase().messages({
        'string.empty': LOCALE.emailPaypalNotEmpty,
        'string.email': LOCALE.invalidEmailPaypal,
    }),
    iban: Joi.string().min(25).max(35).allow('').regex(/^[a-zA-Z0-9 ]+$/).messages({
        'string.min': LOCALE.ibanTooShort,
        'string.max': LOCALE.ibanTooLong,
        'string.pattern.base': LOCALE.invalidRegexIban
    }),
    //ibanAttachment: Joi.any(),
    password: Joi.string().min(8).messages({
        'string.empty': LOCALE.passwordRequired,
        'string.min': LOCALE.passwordTooShort,
    }),
    confirmPassword: Joi.string().min(8).messages({
        'string.empty': LOCALE.passwordRequired,
        'string.min': LOCALE.passwordTooShort,
        'any.only': LOCALE.passwordsNotMatching,
    }),
    //picture: Joi.any(),
});

//////////////////////////////////////////////////////////////////////
//                             Group                                //
//////////////////////////////////////////////////////////////////////

const createGroupSchema = Joi.object({
    name: Joi.string().min(2).max(15).required().messages({
        'string.empty': LOCALE.groupNameRequired,
        'string.min': LOCALE.groupNameTooShort,
        'string.max': LOCALE.groupNameTooLong,
        'any.required': LOCALE.groupNameRequired,
    }),
    description: Joi.string().max(30).allow('').messages({
        'string.max': LOCALE.groupDescriptionTooLong,
    }),
    theme: Joi.string().max(30).required().messages({
        'string.max': LOCALE.groupThemeTooLong,
        'any.required': LOCALE.groupThemeRequired,
    }),
    invited_users: Joi.array().items(Joi.string()).optional()
});

const updateGroupSchema = Joi.object({
    name: Joi.string().min(2).max(15).messages({
        'string.empty': LOCALE.groupNameRequired,
        'string.min': LOCALE.groupNameTooShort,
        'string.max': LOCALE.groupNameTooLong,
    }),
    description: Joi.string().max(30).allow('').messages({
        'string.max': LOCALE.groupDescriptionTooLong,
    }),
    theme: Joi.string().max(30).messages({
        'string.max': LOCALE.groupThemeTooLong,
    })
});

//////////////////////////////////////////////////////////////////////
//                            Expense                               //
//////////////////////////////////////////////////////////////////////

const createExpenseSchema = Joi.object({
    title: Joi.string().min(2).max(15).required().messages({
        'string.empty': LOCALE.expenseTitleRequired,
        'string.min': LOCALE.expenseTitleTooShort,
        'string.max': LOCALE.expenseTitleTooLong,
        'any.required': LOCALE.expenseTitleRequired,
    }),
    amount: Joi.number().min(0).required().messages({
        'number.min': LOCALE.expenseAmountTooLow,
        'any.required': LOCALE.expenseAmountRequired,
        'number.base': LOCALE.expenseAmountRequired,
    }),
    group_id: Joi.string().required().messages({
        'any.required': LOCALE.expenseGroupIdRequired,
    }),
    category: Joi.string().min(2).max(20).messages({
        'string.empty': LOCALE.expenseCategoryNotEmpty,
        'string.min': LOCALE.expenseCategoryTooShort,
        'string.max': LOCALE.expenseCategoryTooLong,
    }),
    refund_recipients: Joi.array().items(Joi.string()).required().messages({
        'any.required': LOCALE.expenseRefundRecipientsRequired,
    }),
    //attachment: Joi.any(),
    isRefunded: Joi.boolean()
});

const updateExpenseSchema = Joi.object({
    title: Joi.string().min(2).max(15).messages({
        'string.empty': LOCALE.expenseTitleRequired,
        'string.min': LOCALE.expenseTitleTooShort,
        'string.max': LOCALE.expenseTitleTooLong,
    }),
    amount: Joi.number().min(0).messages({
        'number.min': LOCALE.expenseAmountTooLow,
        'number.base': LOCALE.expenseAmountRequired,
    }),
    group_id: Joi.string(),
    category: Joi.string().min(2).max(30).messages({
        'string.empty': LOCALE.expenseCategoryNotEmpty,
        'string.min': LOCALE.expenseCategoryTooShort,
        'string.max': LOCALE.expenseCategoryTooLong,
    }),
    refund_recipients: Joi.array().items(Joi.string()),
    //attachment: Joi.any(),
    isRefunded: Joi.boolean()
});

//////////////////////////////////////////////////////////////////////
//                            Messages                              //
//////////////////////////////////////////////////////////////////////

const sendGroupMessageSchema = Joi.object({
    groupId: Joi.string().required().messages({
        'string.empty': LOCALE.groupIdRequired,
        'any.required': LOCALE.groupIdRequired,
    }),
    content: Joi.string().min(1).max(30).required().messages({
        'string.empty': LOCALE.messageNotEmpty,
        'string.min': LOCALE.messageTooShort,
        'string.max': LOCALE.messageTooLong,
        'any.required': LOCALE.messageRequired,
    }),
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
    // Messages
    sendGroupMessageSchema
};
