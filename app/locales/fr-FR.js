module.exports = {
    // User
    notConnected: "Vous n'êtes pas connecté",
    firstNameRequired: "Votre prénom est requis",
    firstNameTooShort: "Votre prénom doit comporter au moins 2 caractères",
    firstNameTooLong: "Votre prénom ne peut pas dépasser 15 caractères",
    lastNameRequired: "Votre nom de famille est requis",
    lastNameTooShort: "Votre nom de famille doit comporter au moins 2 caractères",
    lastNameTooLong: "Votre nom de famille ne peut pas dépasser 15 caractères",
    pseudonymRequired: "Un nom d'utilisateur est requis",
    pseudonymTooShort: "Votre nom d'utilisateur doit comporter au moins 2 caractères",
    pseudonymTooLong: "Votre nom d'utilisateur ne peut pas dépasser 15 caractères",
    emailRequired: "Une adresse e-mail est requise",
    emailTooShort: "Votre adresse e-mail doit comporter au moins 2 caractères",
    emailTooLong: "Votre adresse e-mail ne peut pas dépasser 30 caractères",
    invalidEmail: "Votre adresse e-mail n'est pas valide",
    emailPaypalNotEmpty: "Votre email paypal ne peut pas être vide",
    invalidEmailPaypal: "Votre email paypal n'est pas valide",
    passwordRequired: "Un mot de passe est requis",
    passwordTooShort: "Votre mot de passe doit comporter au moins 8 caractères",
    passwordTooLong: "Votre mot de passe ne peut pas dépasser 30 caractères",
    passwordsNotMatching: "Les mots de passe ne correspondent pas",
    wrongPasswordOrPseudonym: "Mot de passe ou nom d'utilisateur incorrect",
    ibanTooShort: "Votre IBAN doit comporter au moins 25 caractères",
    ibanTooLong: "Votre IBAN ne peut pas dépasser 35 caractères",
    ibanNotEmpty: "Votre IBAN ne peut pas être vide",
    invalidRegexFirstname: "Votre prénom ne peut contenir que des lettres majuscules ou minuscules",
    invalidRegexLastname: "Votre nom ne peut contenir que des lettres majuscules ou minuscules",
    invalidRegexPseudonym: "Votre nom d'utilisateur ne peut contenir que des lettres, des chiffres, et - _",
    invalidRegexIban: "Votre IBAN ne peut contenir que des lettres, des chiffres, et des espaces",
    accountSuccessfullyUpdated: "Votre compte a été mis à jour avec succès",
    accountSuccessfullyDeleted: "Votre compte a été supprimé avec succès",
    passwordSuccessfullyUpdated: "Votre mot de passe a été mis à jour avec succès",
    wrongCurrentPassword: "Votre mot de passe actuel est incorrect",
    newPasswordRequired: "Your new password is required",
    userNotFound: "Nous n'avons pas pu trouver l'utilisateur",
    verificationCodeSentEmail: "Un code de vérification a été envoyé à votre adresse e-mail (vérifiez votre dossier de courrier indésirable)",
    invalidVerificationCodeOrEmail: "Le code de vérification ou l'adresse e-mail est invalide",
    resetCodeExpired: "Le code de vérification a expiré",
    nowDisconnected: "Vous êtes désormais déconnecté",
    pseudonymAlreadyExists: "Ce nom d'utilisateur est déjà utilisé",
    emailAlreadyExists: "Cette adresse email est déjà utilisée",
    googleTokenRequired: "Votre token Google est requis",
    invalidGoogleToken: "Votre token Google n'est pas valide",
    googleUserCannotUpdateAccount: "Les utilisateurs de Google ne peuvent pas mettre à jour leur prénom, nom, nom d'utilisateur, photo et adresse e-mail",
    googleUserCannotResetPassword: "Les utilisateurs de Google ne peuvent pas réinitialiser leur mot de passe",
    passwordResetVerificationCode: "Code de vérification de réinitialisation de votre mot de passe",
    yourVerificationCodeIs: "Votre code de vérification est :",
    verificationCodeSentSuccessfully: "Code de vérification envoyé avec succès. N'oubliez pas de vérifier vos courriers indésirables.",
    emailDoesNotBelongToUser: "Cet e-mail n'appartient à aucun compte existant",
    ibanMalformed: "Votre IBAN en pièce jointe est manquant ou mal formé",
    ibanMustPdf: "Votre IBAN en pièce jointe doit être un fichier PDF",
    pictureMalformed: "Votre photo de profil est manquante ou incorrecte",
    pictureWrongFormat: "Votre photo de profil doit être au format PNG, JPG ou JPEG",
    notAllowedToAccessUserDetails: "Vous n'êtes pas autorisé à accéder aux détails de l'utilisateur",
    cannotDeleteAccountOnlyAdmin: "Vous ne pouvez pas supprimer votre compte car vous êtes le seul administrateur de groupes",

    // Group
    groupNotFound: "Groupe non trouvé",
    notGroupMember: "Vous n'êtes pas membre de ce groupe",
    notGroupAdmin: "Vous n'êtes pas administrateur de ce groupe",
    groupNameRequired: "Un nom de groupe est requis",
    groupNameTooShort: "Le nom du groupe doit comporter au moins 2 caractères",
    groupNameTooLong: "Le nom du groupe ne peut pas dépasser 15 caractères",
    groupDescriptionTooLong: "La description du groupe ne peut pas dépasser 30 caractères",
    groupThemeTooLong: "Le thème du groupe ne peut pas dépasser 30 caractères",
    groupThemeRequired: "Le thème du groupe est requis",
    groupSuccessfullyDeleted: "Le groupe a été supprimé avec succès",
    userDoesNotExist: "L'utilisateur n'existe pas",
    userAlreadyMemberOfGroup: "L'utilisateur est déjà membre du groupe",
    invitationAccepted: "L'invitation a été acceptée",
    invitationDeleted: "L'invitation a été supprimée",
    noInvitationForGroup: "Vous n'avez pas été invité à ce groupe",
    notAllowedToRemoveGroupMembers: "Vous n'êtes pas autorisé à supprimer des membres du groupe",
    notAllowedToRemoveGroup: "Vous n'êtes pas autorisé à supprimer ce groupe",
    notAllowedToViewGroupExpenses: "Vous n'êtes pas autorisé à afficher les dépenses de ce groupe",
    userSuccessfullyRemovedFromGroup: "L'utilisateur a été supprimé du groupe avec succès",
    userHasNoInvitationForGroup: "L'utilisateur n'a pas d'invitation pour ce groupe",
    invalidInvitationValue: "La valeur de l'invitation n'est pas valide",
    adminCannotRemoveOwnMembership: "Vous êtes le seul administrateur du groupe. Faites d'un autre utilisateur administrateur avant de le quitter.",
    adminCannotRevokeOwnAdminPrivilege: "Vous ne pouvez pas supprimer votre propre privilège d'administrateur.",
    notAllowedToUpdateGroupMembership: "Vous n'êtes pas autorisé à modifier l'utilisateur du groupe",
    usersNotFound: "Les utilisateurs suivants sont introuvables:",

    // Expense
    expenseNotFound: "Dépense introuvable",
    expenseTitleRequired: "Un titre de dépense est requis",
    expenseTitleTooShort: "Le titre de la dépense doit comporter au moins 2 caractères",
    expenseTitleTooLong: "Le titre de la dépense ne peut pas dépasser 15 caractères",
    expenseAmountRequired: "Le montant de la dépense est requis",
    expenseAmountTooLow: "Le montant de la dépense ne peut être inférieur à 0€",
    expenseGroupIdRequired: "L'identifiant du groupe de dépenses est requis",
    expenseCategoryNotEmpty: "La catégorie de dépenses ne doit pas être vide",
    expenseCategoryTooShort: "La catégorie de dépenses doit comporter au moins 2 caractères",
    expenseCategoryTooLong: "La catégorie de dépenses ne peut pas dépasser 20 caractères",
    expenseRefundRecipientsRequired: "La valeur des destinataires du remboursement est requise",
    expenseSuccessfullyDeleted: "La dépense a été supprimée avec succès",
    notAllowedToViewExpenseDetails: "Vous n'êtes pas autorisé à afficher cette dépense",
    notAllowedToEditExpense: "Vous n'êtes pas autorisé à modifier cette dépense",
    notAllowedToRemoveExpense: "Vous n'êtes pas autorisé à supprimer cette dépense",

    // Message
    recipientNotFound: "Destinataire introuvable",
    recipientIdRequired: "L'identifiant du destinataire est requis",
    groupIdRequired: "L'identifiant du groupe est requis",
    messageNotEmpty: "Le message ne doit pas être vide",
    messageRequired: "Le message est requis",
    messageTooShort: "Le message doit comporter au moins 1 caractères",
    messageTooLong: "Le message ne peut pas dépasser 30 caractères",
    notAllowedViewGroupMessages: "Vous n'avez pas la permission de consulter les messages de ce groupe",
    internalServerError: "Désolé, un problème est survenu. Veuillez réessayer plus tard"
};
