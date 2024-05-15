//////////////////////////////////////////////////////////////////////
//                             User                                 //
//////////////////////////////////////////////////////////////////////

const notConnectedError = "You are not connected";
const firstNameRequiredError = "Your first name is required";
const firstNameTooShortError = "Your first name must have at least 2 characters";
const firstNameTooLongError = "Your first name can't be over 30 characters";
const lastNameRequiredError = "Your last name is required";
const lastNameTooShortError = "Your last name must have at least 2 characters";
const lastNameTooLongError = "Your last name can't be over 30 characters";
const pseudonymRequiredError = "A pseudonym is required";
const pseudonymTooShortError = "Your pseudonym must have at least 2 characters";
const pseudonymTooLongError = "Your pseudonym can't be over 30 characters";
const emailRequiredError = "An email is required";
const emailTooShortError = "Your email must have at least 2 characters";
const emailTooLongError = "Your email can't be over 30 characters";
const invalidEmailError = "Your email is invalid";
const passwordRequiredError = "A password is required";
const passwordTooShortError = "Your password must have at least 2 characters";
const passwordTooLongError = "Your password can't be over 30 characters";
const passwordsNotMatchingError = "The passwords don't match";
const wrongPasswordOrPseudonymError = "Incorrect password or pseudonym";
const accountSuccessfullyUpdatedMessage = "Your account has been successfully updated";
const accountSuccessfullyDeletedMessage = "Your account has been successfully deleted";
const passwordSuccessfullyUpdatedMessage = "Your password has been successfully updated";
const wrongCurrentPasswordError = "Your current password is incorrect";
const userNotFoundError = "We couldn't find an account with this email";
const verificationCodeSentEmailMessage = "A verification code was sent to your email (check your junk folder)";
const invalidVerificationCodeOrEmailError = "The verification code or email is invalid";

//////////////////////////////////////////////////////////////////////
//                             Group                                //
//////////////////////////////////////////////////////////////////////

const groupNotFoundError = "Group not found";
const notGroupMemberError = "You are not a member of this group";
const notGroupAdminError = "You are not an administrator of this group";
const groupNameRequiredError = "A group name is required";
const groupNameTooShortError = "The group name must have at least 2 characters";
const groupNameTooLongError = "The group name can't be over 30 characters";
const groupDescriptionRequiredError = "A group description is required";
const groupDescriptionTooShortError = "The group description must have at least 2 characters";
const groupDescriptionTooLongError = "The group description can't be over 30 characters";
const groupSuccessfullyDeletedMessage = "The group has been successfully deleted";
const userDoesNotExistError = "The user doesn't exist";
const userAlreadyMemberOfGroupError = "The user is already a member of the group";
const invitationAcceptedMessage = "The invitation was accepted";
const noInvitationForGroupError = "You were not invited to this group";
const notAllowedToRemoveGroupMembersError = "You are not allowed to remove group members";

//////////////////////////////////////////////////////////////////////
//                            Expense                               //
//////////////////////////////////////////////////////////////////////

const expenseNotFoundError = "Expense not found";
const expenseTitleRequiredError = "An expense title is required";
const expenseTitleTooShortError = "The expense title must have at least 2 characters";
const expenseTitleTooLongError = "The expense title can't be over 30 characters";
const expenseAmountRequiredError = "The expense amount is required";
const expenseGroupIdRequiredError = "The expense group id is required";
const expenseCategoryRequiredError = "The expense category is required";
const expenseCategoryTooShortError = "The expense category must have at least 2 characters";
const expenseCategoryTooLongError = "The expense category can't be over 30 characters";
const expenseRefundRecipientsRequiredError = "The refund recipients value is required";
const expenseSuccessfullyDeletedMessage = "The expense was successfully deleted";

//////////////////////////////////////////////////////////////////////
//                          Messages                                //
//////////////////////////////////////////////////////////////////////

const recipientNotFoundError = "Recipient not found";
const messageTooShortError = "The message must have at least 2 characters";
const messageTooLongError = "The message can't be over 2 characters";
const notAllowedViewGroupMessagesError = "You do not have permission to view the messages of this group";


// TODO
// /v1/users/login/google -> error 500 when googleToken is empty
// PUT /v1/users doesn't return in "message" when update was successful
// DEL /v1/users doesn't return in "message" when update was successful
// POST /v1/groups app crashes when the name or description of the group is empty
// Messages -> no check if the user we send the message to exists or not