//////////////////////////////////////////////////////////////////////
//                             User                                 //
//////////////////////////////////////////////////////////////////////

const notConnectedError = "Vous n'êtes pas connecté";
const firstNameRequiredError = "Votre prénom est requis";
const firstNameTooShortError = "Votre prénom doit comporter au moins 2 caractères";
const firstNameTooLongError = "Votre prénom ne peut pas dépasser 30 caractères";
const lastNameRequiredError = "Votre nom de famille est requis";
const lastNameTooShortError = "Votre nom de famille doit comporter au moins 2 caractères";
const lastNameTooLongError = "Votre nom de famille ne peut pas dépasser 30 caractères";
const pseudonymRequiredError = "Un pseudonyme est requis";
const pseudonymTooShortError = "Votre pseudonyme doit comporter au moins 2 caractères";
const pseudonymTooLongError = "Votre pseudonyme ne peut pas dépasser 30 caractères";
const emailRequiredError = "Une adresse e-mail est requise";
const emailTooShortError = "Votre adresse e-mail doit comporter au moins 2 caractères";
const emailTooLongError = "Votre adresse e-mail ne peut pas dépasser 30 caractères";
const invalidEmailError = "Votre adresse e-mail n'est pas valide";
const passwordRequiredError = "Un mot de passe est requis";
const passwordTooShortError = "Votre mot de passe doit comporter au moins 2 caractères";
const passwordTooLongError = "Votre mot de passe ne peut pas dépasser 30 caractères";
const passwordsNotMatchingError = "Les mots de passe ne correspondent pas";
const wrongPasswordOrPseudonymError = "Mot de passe ou pseudonyme incorrect";
const accountSuccessfullyUpdatedMessage = "Votre compte a été mis à jour avec succès";
const accountSuccessfullyDeletedMessage = "Votre compte a été supprimé avec succès";
const passwordSuccessfullyUpdatedMessage = "Votre mot de passe a été mis à jour avec succès";
const wrongCurrentPasswordError = "Votre mot de passe actuel est incorrect";
const userNotFoundError = "Nous n'avons pas pu trouver de compte avec cette adresse e-mail";
const verificationCodeSentEmailMessage = "Un code de vérification a été envoyé à votre adresse e-mail (vérifiez votre dossier de courrier indésirable)";
const invalidVerificationCodeOrEmailError = "Le code de vérification ou l'adresse e-mail est invalide";

//////////////////////////////////////////////////////////////////////
//                             Group                                //
//////////////////////////////////////////////////////////////////////

const groupNotFoundError = "Groupe non trouvé";
const notGroupMemberError = "Vous n'êtes pas membre de ce groupe";
const notGroupAdminError = "Vous n'êtes pas administrateur de ce groupe";
const groupNameRequiredError = "Un nom de groupe est requis";
const groupNameTooShortError = "Le nom du groupe doit comporter au moins 2 caractères";
const groupNameTooLongError = "Le nom du groupe ne peut pas dépasser 30 caractères";
const groupDescriptionRequiredError = "Une description de groupe est requise";
const groupDescriptionTooShortError = "La description du groupe doit comporter au moins 2 caractères";
const groupDescriptionTooLongError = "La description du groupe ne peut pas dépasser 30 caractères";
const groupSuccessfullyDeletedMessage = "Le groupe a été supprimé avec succès";
const userDoesNotExistError = "L'utilisateur n'existe pas";
const userAlreadyMemberOfGroupError = "L'utilisateur est déjà membre du groupe";
const invitationAcceptedMessage = "L'invitation a été acceptée";
const noInvitationForGroupError = "Vous n'avez pas été invité à ce groupe";
const notAllowedToRemoveGroupMembersError = "Vous n'êtes pas autorisé à supprimer des membres du groupe";

//////////////////////////////////////////////////////////////////////
//                            Expense                               //
//////////////////////////////////////////////////////////////////////

const expenseNotFoundError = "Dépense introuvable";
const expenseTitleRequiredError = "Un titre de dépense est requis";
const expenseTitleTooShortError = "Le titre de la dépense doit comporter au moins 2 caractères";
const expenseTitleTooLongError = "Le titre de la dépense ne peut pas dépasser 30 caractères";
const expenseAmountRequiredError = "Le montant de la dépense est requis";
const expenseGroupIdRequiredError = "L'identifiant du groupe de dépenses est requis";
const expenseCategoryRequiredError = "La catégorie de dépenses est requise";
const expenseCategoryTooShortError = "La catégorie de dépenses doit comporter au moins 2 caractères";
const expenseCategoryTooLongError = "La catégorie de dépenses ne peut pas dépasser 30 caractères";
const expenseRefundRecipientsRequiredError = "La valeur des destinataires du remboursement est requise";
const expenseSuccessfullyDeletedMessage = "La dépense a été supprimée avec succès";

//////////////////////////////////////////////////////////////////////
//                          Messages                                //
//////////////////////////////////////////////////////////////////////

const recipientNotFoundError = "Destinataire introuvable";
const messageTooShortError = "Le message doit comporter au moins 2 caractères";
const messageTooLongError = "Le message ne peut pas dépasser 2 caractères";
const notAllowedViewGroupMessagesError = "Vous n'avez pas la permission de consulter les messages de ce groupe";
