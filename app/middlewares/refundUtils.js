// Mock function to calculate refund recipients based on expense
const getRefundRecipients = (expense) => {
    const { amount, refund_recipients } = expense;
    const numRecipients = refund_recipients.length;

    if (numRecipients === 0) {
        return [];
    }

    // Calculate amount to be refunded to each recipient
    const refundAmountPerRecipient = amount / numRecipients;

    // Construct an array of refund objects for each recipient
    return refund_recipients.map(recipient => ({
        recipient_id: recipient,
        refund_amount: refundAmountPerRecipient
    }));
};

module.exports = { getRefundRecipients };
