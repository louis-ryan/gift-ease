import React from 'react';

const BalanceDashboard = ({ data }) => {
    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Ensure data is always an array
    const payments = Array.isArray(data) ? data : [];
    // Calculate total paid from payments array
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return (
        <div>
            {/* Total Paid Balance Section */}
            <div style={{
                border: '1px solid lightgrey',
                padding: '16px',
                borderRadius: '4px',
                marginBottom: '20px',
                backgroundColor: '#f9f9f9'
            }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Total Paid</h2>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    marginBottom: '8px'
                }}>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            {formatCurrency(totalPaid)}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                            USD
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
                            Received
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div style={{
                border: '1px solid lightgrey',
                padding: '16px',
                borderRadius: '4px'
            }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Payment History</h2>
                <div>
                    {payments && payments.length > 0 ? (
                        payments.map((payment) => {
                            return (
                                <div key={payment.id} style={{
                                    padding: '16px 0',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                                                {formatCurrency(payment.amount)}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#666' }}>
                                                {formatDate(payment.date)}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#999' }}>
                                                {payment.id}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            Event ID: {payment.eventId.substring(0, 8)}...
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', color: '#666' }}>
                                                Gift ID: {payment.giftId.substring(0, 8)}...
                                            </div>
                                            <div style={{ 
                                                fontSize: '12px', 
                                                color: payment.status === 'succeeded' ? '#2e7d32' : '#d32f2f',
                                                fontWeight: 'bold'
                                            }}>
                                                Status: {payment.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ padding: '16px 0', color: '#666' }}>
                            No payment history available
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