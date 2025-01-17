import { useState } from 'react';

const CreatePayoutLink = (accountId) => {
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
        <div>
            <h3>Complete Your Payout Setup</h3>
            <p>
                Your account is set up to accept payments, but payouts are not yet enabled.
                Complete your payout information to receive payments in your bank account.
            </p>

            {error && (
                <div>
                    {error}
                </div>
            )}

            <button
                onClick={handleSetupClick}
                disabled={isLoading}
            >
                {isLoading ? 'Loading...' : 'Complete Payout Setup'}
            </button>
        </div>
    );
}

export default CreatePayoutLink

