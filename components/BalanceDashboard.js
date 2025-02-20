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

    const isFirstPayoutComplete = (transferDate) => {
        const now = new Date();
        const transferTimestamp = transferDate * 1000;
        const sevenDayPayoutDate = new Date(transferTimestamp + (7 * 24 * 60 * 60 * 1000));
        return now > sevenDayPayoutDate;
    };

    // Find first valid payout (above threshold) and check if it's complete
    const firstValidTransfer = data.recent_transfers.find(transfer => 
        isAboveThreshold(transfer.amount)
    );
    
    const hasCompletedFirstPayout = firstValidTransfer ? 
        isFirstPayoutComplete(firstValidTransfer.created) : false;

    const getEstimatedPayoutDate = (transferDate, amount) => {
        if (!isAboveThreshold(amount)) {
            return null; // No payout date for small amounts
        }
        const transferTimestamp = transferDate * 1000;
        const isFirstValid = firstValidTransfer && 
            firstValidTransfer.id === data.recent_transfers.find(t => 
                isAboveThreshold(t.amount)
            )?.id;
        const delayDays = (isFirstValid && !hasCompletedFirstPayout) ? 7 : 3;
        const payoutDate = new Date(transferTimestamp + (delayDays * 24 * 60 * 60 * 1000));
        return payoutDate;
    };

    const isPayoutComplete = (transferDate, amount) => {
        if (!isAboveThreshold(amount)) {
            return false;
        }
        const now = new Date();
        const payoutDate = getEstimatedPayoutDate(transferDate, amount);
        return payoutDate ? now > payoutDate : false;
    };

    const calculateProgress = (transferDate, amount) => {
        if (!isAboveThreshold(amount)) {
            return 0;
        }
        const now = new Date();
        const transferDateTime = new Date(transferDate * 1000);
        const payoutDateTime = getEstimatedPayoutDate(transferDate, amount);

        if (!payoutDateTime) return 0;

        const total = payoutDateTime - transferDateTime;
        const elapsed = now - transferDateTime;

        return Math.min(Math.max((elapsed / total) * 100, 0), 100);
    };

    return (
        <div>
            <div style={{
                border: '1px solid lightgrey',
                padding: '16px',
                borderRadius: '4px'
            }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Recent Transfers & Expected Payouts</h2>
                <div>
                    {data.recent_transfers.map((transfer) => {
                        const progress = calculateProgress(transfer.created, transfer.amount);
                        const complete = isPayoutComplete(transfer.created, transfer.amount);
                        const isSmallAmount = !isAboveThreshold(transfer.amount);

                        return (
                            <div key={transfer.id} style={{
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
                                            {formatCurrency(transfer.amount, transfer.currency)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#999' }}>
                                            ID: {transfer.id}
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
                                                {formatDate(transfer.created)}
                                            </span>
                                            <span style={{
                                                color: progress < 60 ? '#333' : '#fff'
                                            }}>
                                                {formatDate(getEstimatedPayoutDate(transfer.created, transfer.amount).getTime() / 1000)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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