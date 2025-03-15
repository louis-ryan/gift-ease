import React from 'react';

const BalanceDashboard = ({ data }) => {
    const formatCurrency = (amount, currency) => {
        const value = Math.abs(amount) / 100;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isAboveThreshold = (amount) => {
        return amount >= 100; // 100 cents = $1 USD
    };

    const isFirstPayoutComplete = (transactionDate) => {
        const now = new Date();
        const transactionTimestamp = transactionDate * 1000;
        const sevenDayPayoutDate = new Date(transactionTimestamp + (7 * 24 * 60 * 60 * 1000));
        return now > sevenDayPayoutDate;
    };

    // Find first valid transaction (above threshold) and check if it's complete
    const firstValidTransaction = data.recent_transactions ?
        data.recent_transactions.find(transaction =>
            isAboveThreshold(transaction.amount)
        ) : null;

    const hasCompletedFirstPayout = firstValidTransaction ?
        isFirstPayoutComplete(firstValidTransaction.created) : false;

    const getEstimatedPayoutDate = (transactionDate, amount) => {
        if (!isAboveThreshold(amount)) {
            return null; // No payout date for small amounts
        }
        const transactionTimestamp = transactionDate * 1000;
        const isFirstValid = firstValidTransaction &&
            firstValidTransaction.id === data.recent_transactions.find(t =>
                isAboveThreshold(t.amount)
            )?.id;
        const delayDays = (isFirstValid && !hasCompletedFirstPayout) ? 7 : 3;
        const payoutDate = new Date(transactionTimestamp + (delayDays * 24 * 60 * 60 * 1000));
        return payoutDate;
    };

    const isPayoutComplete = (transactionDate, amount) => {
        if (!isAboveThreshold(amount)) {
            return false;
        }
        const now = new Date();
        const payoutDate = getEstimatedPayoutDate(transactionDate, amount);
        return payoutDate ? now > payoutDate : false;
    };

    const calculateProgress = (transactionDate, amount) => {
        if (!isAboveThreshold(amount)) {
            return 0;
        }
        const now = new Date();
        const transactionDateTime = new Date(transactionDate * 1000);
        const payoutDateTime = getEstimatedPayoutDate(transactionDate, amount);

        if (!payoutDateTime) return 0;

        const total = payoutDateTime - transactionDateTime;
        const elapsed = now - transactionDateTime;

        return Math.min(Math.max((elapsed / total) * 100, 0), 100);
    };

    // Only show payment_intent type transactions that are incoming payments
    const relevantTransactions = data.recent_transactions ?
        data.recent_transactions.filter(transaction =>
            transaction.type === 'payment' ||
            transaction.type === 'payment_intent' ||
            transaction.type === 'charge'
        ) : [];

    return (
        <div>
            <div style={{
                border: '1px solid lightgrey',
                padding: '16px',
                borderRadius: '4px'
            }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Recent Payments & Expected Payouts</h2>
                <div>
                    {relevantTransactions.length > 0 ? (
                        relevantTransactions.map((transaction) => {
                            const progress = calculateProgress(transaction.created, transaction.amount);
                            const complete = isPayoutComplete(transaction.created, transaction.amount);
                            const isSmallAmount = !isAboveThreshold(transaction.amount);

                            return (
                                <div key={transaction.id} style={{
                                    padding: '16px 0',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '12px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                                                {formatCurrency(transaction.amount, transaction.currency)}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#999' }}>
                                                {transaction.description || `Type: ${transaction.type}`}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#999' }}>
                                                ID: {transaction.id}
                                            </div>
                                        </div>
                                        {isSmallAmount ? (
                                            <div style={{
                                                backgroundColor: '#fff3cd',
                                                color: '#856404',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}>
                                                Below Minimum Threshold
                                            </div>
                                        ) : complete ? (
                                            <div style={{
                                                backgroundColor: '#e8f5e9',
                                                color: '#2e7d32',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}>
                                                Payout Complete
                                            </div>
                                        ) : null}
                                    </div>

                                    {!isSmallAmount && (
                                        <div style={{
                                            position: 'relative',
                                            height: '24px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '12px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                height: '100%',
                                                width: `${progress}%`,
                                                backgroundColor: complete ? '#4caf50' : '#2196f3',
                                                transition: 'width 0.3s ease'
                                            }} />

                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0 12px',
                                                color: '#fff',
                                                fontSize: '12px',
                                                zIndex: 1
                                            }}>
                                                <span style={{
                                                    color: progress > 40 ? '#fff' : '#333'
                                                }}>
                                                    {formatDate(transaction.created)}
                                                </span>
                                                <span style={{
                                                    color: progress < 60 ? '#333' : '#fff'
                                                }}>
                                                    {getEstimatedPayoutDate(transaction.created, transaction.amount) ?
                                                        formatDate(getEstimatedPayoutDate(transaction.created, transaction.amount).getTime() / 1000) :
                                                        'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ padding: '16px 0', color: '#666' }}>
                            No transaction history available
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#666'
            }}>
                <p>Note:</p>
                <p>
                    Payout timing may vary based on your account status and bank processing times.
                    First-time payouts typically take 7 days, while subsequent payouts usually process in 2-3 business days.
                </p>
                <p>
                    Payments under $1 USD will not be processed for payout
                </p>
                <p>
                    Please allow some time for your first payment to process
                </p>
            </div>
        </div>
    );
};

export default BalanceDashboard;