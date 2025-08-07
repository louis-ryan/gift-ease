import { useState } from 'react';

const CreatePayoutLink = ({ accountId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSetupClick = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/createPayoutLink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accountId),
            });

            if (!response.ok) {
                throw new Error('Failed to create setup link');
            }

            const { url } = await response.json();

            // Redirect to Stripe
            window.location.href = url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="payout-setup">
            <div className="payout-content">
                <div className="payout-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#10B981"/>
                        <path d="M19 15L19.74 17.74L22.5 18.5L19.74 19.26L19 22L18.26 19.26L15.5 18.5L18.26 17.74L19 15Z" fill="#10B981"/>
                        <path d="M5 6L5.37 7.37L6.74 7.74L5.37 8.11L5 9.5L4.63 8.11L3.26 7.74L4.63 7.37L5 6Z" fill="#10B981"/>
                    </svg>
                </div>
                
                <div className="payout-info">
                    <h3 className="payout-title">Complete Your Payout Setup</h3>
                    <p className="payout-description">
                        Your account is set up to accept payments, but payouts are not yet enabled. 
                        Complete your payout information to receive payments in your bank account.
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        <div className="error-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 8V12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 16H12.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span>{error}</span>
                    </div>
                )}

                <button
                    className="payout-button"
                    onClick={handleSetupClick}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Setting up...</span>
                        </>
                    ) : (
                        <>
                            <span>Complete Payout Setup</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </>
                    )}
                </button>
            </div>

            <style jsx>{`
                .payout-setup {
                    background: #F0FDF4;
                    border: 1px solid #BBF7D0;
                    border-radius: 12px;
                    padding: 24px;
                    margin-top: 24px;
                }

                .payout-content {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .payout-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    background-color: #DCFCE7;
                    border-radius: 50%;
                    border: 2px solid #10B981;
                }

                .payout-info {
                    flex: 1;
                }

                .payout-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #166534;
                    margin: 0 0 8px 0;
                }

                .payout-description {
                    font-size: 14px;
                    color: #166534;
                    line-height: 1.6;
                    margin: 0;
                }

                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #FEF2F2;
                    border: 1px solid #FECACA;
                    color: #DC2626;
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                }

                .error-icon {
                    flex-shrink: 0;
                }

                .payout-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: #10B981;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                }

                .payout-button:hover:not(:disabled) {
                    background: #059669;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .payout-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .loading-spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (max-width: 640px) {
                    .payout-setup {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
}

export default CreatePayoutLink;

