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

    // When using the charges API, we don't need to filter by type
    // since all objects returned are already charges
    const relevantTransactions = data?.recent_transactions || [];

    return (
        <div>
            {/* Pending Balance Section - Added to show pending funds */}
            {data?.pending_balance && data.pending_balance.length > 0 && (
                <div style={{
                    border: '1px solid lightgrey',
                    padding: '16px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    backgroundColor: '#f9f9f9'
                }}>
                    <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Pending Balance</h2>
                    {data.pending_balance.map((balance, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '12px',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            marginBottom: '8px'
                        }}>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    {formatCurrency(balance.amount, balance.currency)}
                                </div>
                                <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                    {balance.currency.toUpperCase()}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ 
                                    backgroundColor: '#e3f2fd',
                                    color: '#0d47a1',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    marginBottom: '4px'
                                }}>
                                    Pending
                                </div>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    Est. arrival: {new Date(balance.estimated_arrival).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Available Balance Section */}
            {data?.available_balance && data.available_balance.length > 0 && 
             data.available_balance.some(balance => balance.amount > 0) && (
                <div style={{
                    border: '1px solid lightgrey',
                    padding: '16px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    backgroundColor: '#f9f9f9'
                }}>
                    <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Available Balance</h2>
                    {data.available_balance.map((balance, index) => (
                        balance.amount > 0 && (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '12px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                marginBottom: '8px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                        {formatCurrency(balance.amount, balance.currency)}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                        {balance.currency.toUpperCase()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ 
                                        backgroundColor: '#e8f5e9',
                                        color: '#2e7d32',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}>
                                        Available
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* Transactions Section */}
            <div style={{
                border: '1px solid lightgrey',
                padding: '16px',
                borderRadius: '4px'
            }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Recent Payments & Expected Payouts</h2>
                <div>
                    {relevantTransactions && relevantTransactions.length > 0 ? (
                        relevantTransactions.map((transaction) => {
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
                                                {transaction.description || `Payment via ${transaction.payment_method || 'unknown'}`}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#999' }}>
                                                ID: {transaction.id}
                                            </div>
                                        </div>
                                        <div style={{
                                            backgroundColor: 
                                                transaction.status === 'succeeded' ? '#e8f5e9' : 
                                                transaction.status === 'pending' ? '#fff3cd' : '#f5f5f5',
                                            color: 
                                                transaction.status === 'succeeded' ? '#2e7d32' : 
                                                transaction.status === 'pending' ? '#856404' : '#666',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}>
                                            {transaction.status === 'succeeded' ? 'Completed' : 
                                             transaction.status === 'pending' ? 'Pending' : transaction.status}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        {formatDate(transaction.created)}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ padding: '16px 0', color: '#666' }}>
                            No recent transaction history available
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
            </div>
        </div>
    );
};

export default BalanceDashboard;