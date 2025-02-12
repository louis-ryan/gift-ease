import React from 'react';

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

// Calculate estimated payout date (typically 7 days for new accounts, 2-3 for established ones)
const getEstimatedPayoutDate = (transferDate) => {
    const transferTimestamp = transferDate * 1000;
    const payoutDate = new Date(transferTimestamp + (7 * 24 * 60 * 60 * 1000)); // 7 days from transfer
    return formatDate(payoutDate.getTime() / 1000);
};

const BalanceDashboard = ({ data }) => {
    const hasNegativeBalance =
        data.available_balance.some(b => b.amount < 0) ||
        data.pending_balance.some(b => b.amount < 0);

    return (
        <div>
            {hasNegativeBalance && (
                <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeeba',
                    padding: '16px',
                    marginBottom: '20px',
                    borderRadius: '4px'
                }}>
                    <p style={{ color: '#856404', margin: 0 }}>
                        Your account currently shows a negative balance. This will be offset by incoming transfers.
                    </p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{
                    border: '1px solid lightgrey',
                    padding: '16px',
                    borderRadius: '4px'
                }}>
                    <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Pending Balance</h2>
                    {data.pending_balance.map((balance, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '10px'
                        }}>
                            <span style={{ color: '#666' }}>
                                Expected {new Date(balance.estimated_arrival).toLocaleDateString()}
                            </span>
                            <span style={{
                                fontWeight: '500',
                                color: balance.amount < 0 ? '#dc3545' : '#28a745'
                            }}>
                                {formatCurrency(balance.amount, balance.currency)}
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{
                    border: '1px solid lightgrey',
                    padding: '16px',
                    borderRadius: '4px'
                }}>
                    <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Available Balance</h2>
                    {data.available_balance.map((balance, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '10px'
                        }}>
                            <span style={{ color: '#666' }}>Available now</span>
                            <span style={{
                                fontWeight: '500',
                                color: balance.amount < 0 ? '#dc3545' : '#28a745'
                            }}>
                                {formatCurrency(balance.amount, balance.currency)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{
                border: '1px solid lightgrey',
                padding: '16px',
                borderRadius: '4px'
            }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Recent Transfers & Expected Payouts</h2>
                <div>
                    {data.recent_transfers.map((transfer) => (
                        <div key={transfer.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '10px 0',
                            borderBottom: '1px solid #eee'
                        }}>
                            <div>
                                <div style={{ color: '#666' }}>
                                    Transfer date: {formatDate(transfer.created)}
                                </div>
                                <div style={{ color: '#666', marginTop: '4px' }}>
                                    Expected payout: {getEstimatedPayoutDate(transfer.created)}
                                </div>
                                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                                    ID: {transfer.id}
                                </div>
                            </div>
                            <span style={{
                                fontWeight: '500',
                                color: '#28a745'
                            }}>
                                {formatCurrency(transfer.amount, transfer.currency)}
                            </span>
                        </div>
                    ))}
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
                    Payments under a certain threshhold (around $1USD) will not payout on their own
                </p>
                <p>
                    Please allow some time for your first payment to process
                </p>
            </div>
        </div>
    );
};

export default BalanceDashboard;