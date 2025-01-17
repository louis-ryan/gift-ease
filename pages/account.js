import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import { COUNTRY_BANK_FORMATS } from '../countryBankFormats';
import ConnectOnboarding from '../components/ConnectOnboarding';
import CreatePayoutLink from '../components/CreatePayoutLink';
import AccountStatus from '../components/AccountStatus';
import {
    renderPersonalInfo,
    renderAddress,
    renderDOB,
    renderBankInfo
} from '../components/OnboardingForm'


const StripeRegistration = (props) => {

    console.log("props from account: ", props.onboardingData)

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        country: 'US',
        address: {
            line1: '',
            city: '',
            state: '',
            postal_code: ''
        },
        dob: {
            day: '',
            month: '',
            year: ''
        },
        bankAccount: {
            account_holder_name: ''
        }
    });

    console.log("form data: ", formData)

    const { user } = useUser();

    const getFormattedPhone = (formData) => {
        const prefix = COUNTRY_BANK_FORMATS[formData.country]?.phonePrefix || '';
        const cleanPhone = formData.phone.replace(prefix, '');
        return `${prefix}${cleanPhone}`;
    };

    const checkOnboardingStatus = async (accountId) => {
        const accountRes = await fetch(`/api/checkOnboardingStatus?id=${accountId}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const onboardingData = await accountRes.json();
        props.setOnboardingData(onboardingData)
    }

    const setAccountId = async (accountId) => {
        try {
            await fetch(`/api/setAccountId?id=${props.stripeUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify({
                    stripeAccountId: accountId
                })
            });
        } catch (error) {
            console.error('Error setting stripe user account id in Mongo:', error);
        }
    }

    const deleteStripeAccount = async (userId, accountId) => {
        try {
            await fetch('/api/deleteStripeAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stripeAccountId: accountId,
                    user: userId
                })
            });
        } catch (error) {
            console.error('Error deleting user stripe account:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else if (name === 'country') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                bankAccount: { account_holder_name: prev.bankAccount.account_holder_name }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleBankAccountChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            bankAccount: {
                ...prev.bankAccount,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/stripeCustomOnboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    phone: getFormattedPhone(formData)
                }),
            });

            const data = await response.json();

            if (data.success) {
                props.setAccountId(data.accountId)
                setAccountId(data.accountId)
            } else {
                setError(data.message || 'Something went wrong');
            }
        } catch (err) {
            setError('Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!user) return
        getOrCreateNewAccount(
            user.sub,
            user.email,
            props.setCurrentEvent,
            props.setAccountId,
            props.setStripeUserId,
            props.setModalOpen,
            props.setNotes,
        )
    }, [user])

    useEffect(() => {
        if (!props.accountId) return
        checkOnboardingStatus(props.accountId)
    }, [props.accountId])

    if (!props.currentEvent) return
    if (!user) return
    return (
        <div className="container">
            <div className="wrapper">

                <h1>Account</h1>

                <h4>Your Details are submitted: {`${props.onboardingData.isDetailsSubmitted}`}</h4>
                <h4>Payouts are enabled: {`${props.onboardingData.payoutsEnabled}`}</h4>

                <div style={{ border: "1px solid grey", padding: "16px" }}>
                    {!props.onboardingData.isDetailsSubmitted && (
                        <>
                            <h2>Submit Your Details</h2>
                            <p>Step {step} of 4</p>
                            {error && <div className="error">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                {step === 1 && renderPersonalInfo(formData, handleInputChange, setStep)}
                                {step === 2 && renderAddress(formData, handleInputChange, setStep)}
                                {step === 3 && renderDOB(formData, handleInputChange, setStep)}
                                {step === 4 && renderBankInfo(formData, handleBankAccountChange, setStep, loading)}
                            </form>
                        </>
                    )}

                    {props.onboardingData.isDetailsSubmitted && !props.onboardingData.payoutsEnabled && (
                        <CreatePayoutLink accountId={props.accountId} />
                    )}

                </div>

                <div style={{ height: "32px" }} />

                <button onClick={() => deleteStripeAccount(user.sub, props.accountId)}>DELETE ACCOUNT</button>

            </div>
        </div>
    )
}

export default StripeRegistration;