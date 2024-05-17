module.exports = {
    // User
    notConnected: "You are not connected",
    firstNameRequired: "Your first name is required",
    firstNameTooShort: "Your first name must have at least 2 characters",
    firstNameTooLong: "Your first name can't be over 15 characters",
    lastNameRequired: "Your last name is required",
    lastNameTooShort: "Your last name must have at least 2 characters",
    lastNameTooLong: "Your last name can't be over 15 characters",
    pseudonymRequired: "A pseudonym is required",
    pseudonymTooShort: "Your pseudonym must have at least 2 characters",
    pseudonymTooLong: "Your pseudonym can't be over 15 characters",
    emailRequired: "An email is required",
    emailTooShort: "Your email must have at least 2 characters",
    emailTooLong: "Your email can't be over 30 characters",
    invalidEmail: "Your email is invalid",
    passwordRequired: "A password is required",
    passwordTooShort: "Your password must have at least 8 characters",
    passwordTooLong: "Your password can't be over 30 characters",
    passwordsNotMatching: "The passwords don't match",
    wrongPasswordOrPseudonym: "Incorrect password or pseudonym",
    ibanTooShort: "Your IBAN must be at least 25 characters long",
    ibanTooLong: "Your IBAN cannot exceed 35 characters",
    ibanNotEmpty: "Your IBAN cannot be empty",
    accountSuccessfullyUpdated: "Your account has been successfully updated",
    accountSuccessfullyDeleted: "Your account has been successfully deleted",
    passwordSuccessfullyUpdated: "Your password has been successfully updated",
    wrongCurrentPassword: "Your current password is incorrect",
    userNotFound: "We couldn't find the user",
    verificationCodeSentEmail: "A verification code was sent to your email (check your junk folder)",
    invalidVerificationCodeOrEmail: "The verification code or email is invalid",
    resetCodeExpired: "The verification code has expired",
    nowDisconnected: "You are now disconnected",
    pseudonymAlreadyExists: "This pseudonym is already in use",
    emailAlreadyExists: "This email address is already in use",
    googleTokenRequired: "Your google token is required",
    googleUserCannotUpdateAccount: "Google users can't update their firstname, lastname, pseudonym, picture and email",
    googleUserCannotResetPassword: "Google users can't reset their password",
    passwordResetVerificationCode: "Password Reset Verification Code",
    yourVerificationCodeIs: "Your verification code is:",
    verificationCodeSentSuccessfully: "Verification code sent successfully. Don't forget to check your junks",
    emailDoesNotBelongToUser: "This email does not belong to any existing account",
    ibanMalformed: "Your IBAN attachment is missing or malformed",
    ibanMustPdf: "Your IBAN attachment must be a PDF file",

    // Group
    groupNotFound: "Group not found",
    notGroupMember: "You are not a member of this group",
    notGroupAdmin: "You are not an administrator of this group",
    groupNameRequired: "A group name is required",
    groupNameTooShort: "The group name must have at least 2 characters",
    groupNameTooLong: "The group name can't be over 15 characters",
    groupDescriptionTooLong: "The group description can't be over 30 characters",
    groupSuccessfullyDeleted: "The group has been successfully deleted",
    userDoesNotExist: "The user doesn't exist",
    userAlreadyMemberOfGroup: "The user is already a member of the group",
    invitationAccepted: "The invitation was accepted",
    invitationDeleted: "The invitation was deleted",
    noInvitationForGroup: "You were not invited to this group",
    notAllowedToRemoveGroupMembers: "You are not allowed to remove group members",
    notAllowedToRemoveGroup: "You are not allowed to remove this group",
    notAllowedToViewGroupExpenses: "You are not allowed to view expenses of this group",
    userSuccessfullyRemovedFromGroup: "User successfully removed from group",
    userHasNoInvitationForGroup: "User has no invitation for this group",
    invalidInvitationValue: "Invalid invitation value",
    adminCannotRemoveOwnMembership: "Group admin cannot remove himself from the group",

    // Expense
    expenseNotFound: "Expense not found",
    expenseTitleRequired: "An expense title is required",
    expenseTitleTooShort: "The expense title must have at least 2 characters",
    expenseTitleTooLong: "The expense title can't be over 15 characters",
    expenseAmountRequired: "The expense amount is required",
    expenseAmountTooLow: "The expense amount can't be lower than 0€",
    expenseGroupIdRequired: "The expense group id is required",
    expenseCategoryNotEmpty: "The expense category must not be empty",
    expenseCategoryTooShort: "The expense category must have at least 2 characters",
    expenseCategoryTooLong: "The expense category can't be over 15 characters",
    expenseRefundRecipientsRequired: "The refund recipients value is required",
    expenseSuccessfullyDeleted: "The expense was successfully deleted",
    notAllowedToViewExpenseDetails: "You are not allowed to view this expense",
    notAllowedToEditExpense: "You are not allowed to edit this expense",
    notAllowedToRemoveExpense: "You are not allowed to remove this expense",

    // Message
    recipientNotFound: "Recipient not found",
    recipientIdRequired: "Recipient id is required",
    groupIdRequired: "Group id is required",
    messageNotEmpty: "The message must not be empty",
    messageRequired: "The message is required",
    messageTooShort: "The message must have at least 1 character",
    messageTooLong: "The message can't be over 30 characters",
    notAllowedViewGroupMessages: "You do not have permission to view the messages of this group",
    internalServerError: "Sorry, there was a problem. Please try again later"
};
