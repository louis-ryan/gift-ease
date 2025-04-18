import React from 'react';
import currencies from '../utils/currencyList';

const CurrencySelector = ({selectedCurrency, setSelectedCurrency, stripeUserId}) => {

    const setAccountCurrency = async (e) => {
        const newCurrency = e.target.value;
        try {
            const account = await fetch(`/api/setAccountCurrency?id=${stripeUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify({
                    currency: newCurrency
                })
            });
            const { data } = await account.json();
            setSelectedCurrency(data.currency)
        } catch (error) {
            console.error('Error setting stripe user account id in Mongo:', error);
        }
    }

    // const handleCurrencyChange = (e) => {
    //     const newCurrency = e.target.value;
    //     setSelectedCurrency(newCurrency);
    // };

    return (
        <div>
            <select
                value={selectedCurrency}
                onChange={setAccountCurrency}
            >
                {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CurrencySelector;