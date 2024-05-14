const getBalances = async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.userId;

    try {
        const isMember = await GroupMembership.exists({ user_id: userId, group_id: groupId });

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Retrieve expenses for the group
        const expenses = await Expense.find({ group_id: groupId });

        // Initialize balances object
        const balances = {};

        // Calculate how much each user owes to others and how much others owe them
        expenses.forEach(expense => {
            // If the current user paid the expense
            if (expense.creator_id === userId) {
                expense.refund_recipients.forEach(recipient => {
                    if (recipient && recipient.recipient_id) {
                        const recipientId = recipient.recipient_id.toString();
                        if (!balances[recipientId]) balances[recipientId] = 0;
                        balances[recipientId] += recipient.refund_amount;
                    }
                });
            } else if (expense.refund_recipients.map(r => r.recipient_id.toString()).includes(userId)) {
                // If the current user was one of the recipients of the expense
                const recipientAmount = expense.refund_recipients.find(r => r.recipient_id.toString() === userId);
                if (recipientAmount) {
                    if (!balances[expense.creator_id]) balances[expense.creator_id] = 0;
                    balances[expense.creator_id] -= recipientAmount.refund_amount;
                }
            }
        });

        // Calculate total spend by the current user
        const totalSpend = expenses.filter(expense => expense.creator_id === userId).reduce((acc, expense) => acc + expense.amount, 0);

        // Calculate total owe by the current user
        const totalOwe = Object.values(balances).reduce((acc, balance) => acc + balance, 0);

        // Calculate final balances
        const finalBalances = {};
        finalBalances[userId] = totalSpend - totalOwe;

        res.status(200).json(finalBalances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBalances };
