import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import BalanceDashboard from '../components/BalanceDashboard';


const StripeRegistration = (props) => {

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        country: 'US',
        bankAccount: {
            account_holder_name: ''
        }
    });
    const [transactionData, setTransactionData] = useState({
        available_balance: [],
        pending_balance: [],
        pending_payouts: [],
        recent_transfers: []
    })

    const { user } = useUser();

    const router = useRouter()

    const getFormattedPhone = (formData) => {
        const prefix = COUNTRY_BANK_FORMATS[formData.country]?.phonePrefix || '';
        const cleanPhone = formData.phone.replace(prefix, '');
        return `${prefix}${cleanPhone}`;
    };

    const getTransactionData = async (accountId) => {
        const res = await fetch(`/api/getTransactionInfo?accountId=${accountId}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const transactionDataFromStripe = await res.json();
        setTransactionData(transactionDataFromStripe
        )
    }

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

    const setPaymentSetupComplete = async (userId) => {
        try {
            const accountRes = await fetch(`/api/setPaymentSetupComplete?id=${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            const { data } = await accountRes.json();
            props.setAccountSetupComplete(data.accountSetupComplete)
        } catch (error) {
            console.error('Error setting setup complete value:', error);
        }
    }

    // const deleteStripeAccount = async (userId, accountId) => {
    //     try {
    //         await fetch('/api/deleteStripeAccount', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 stripeAccountId: accountId,
    //                 user: userId
    //             })
    //         });
    //     } catch (error) {
    //         console.error('Error deleting user stripe account:', error);
    //     }
    // };

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
        if (!router) return
        if (!router.query.setup) return
        if (!props.stripeUserId) return
        setPaymentSetupComplete(props.stripeUserId)
    }, [router, props.stripeUserId])


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
            props.setAccountSetupComplete
        )
        setFormData({ ...formData, email: user.email })
    }, [user])

    useEffect(() => {
        if (!props.accountId) return
        checkOnboardingStatus(props.accountId)
        getTransactionData(props.accountId)
    }, [props.accountId])

    if (!props.currentEvent) return
    if (!user) return
    return (
        <div className="container" >
            <div style={{ width: "600px" }}>

                <Link href={"/"}>
                    <h4>{"< Back to Dashboard"}</h4>
                </Link>

                {props.accountSetupComplete ? (
                    <>
                        <div style={{ border: "1px solid lightgrey", padding: "16px", borderRadius: "4px" }}>
                            <h4>Your Account ID: {props.accountId}</h4>
                        </div>

                        <div style={{ height: "16px" }} />

                        <BalanceDashboard data={transactionData} />
                    </>

                ) : (
                    <>
                        {!props.onboardingData.isDetailsSubmitted ? (
                            <>
                                <h4>Step 1 of 2</h4>
                                <h2>Submit Your Details</h2>
                                {/* <p>Step {step} of 2</p> */}
                                {error && <div className="error">{error}</div>}
                                <form onSubmit={handleSubmit}>
                                    {step && renderPersonalInfo(formData, handleInputChange, setStep)}
                                    {/* {step === 2 && renderAddress(formData, handleInputChange, setStep)}
                                    {step === 3 && renderDOB(formData, handleInputChange, setStep)} */}
                                    {step && renderBankInfo(formData, handleBankAccountChange, setStep, loading)}
                                </form>

                                {/* <img
                                    src="/poweredbystripe2.png"
                                    alt="powered by stripe logo"
                                    style={{ width: "100%", opacity: "50%", padding: "80px" }}
                                /> */}
                            </> 
                        ) : (
                            <>
                                <h4>Step 2 of 2</h4>
                                <h2>Finalise Setup with Stripe</h2>
                                <CreatePayoutLink accountId={props.accountId} />
                            </>

                        )}
                    </>
                )
                }



                {/* <div style={{ height: "32px" }} />

                <button onClick={() => deleteStripeAccount(user.sub, props.accountId)}>DELETE ACCOUNT</button> */}

            </div>
        </div>
    )
}

export default StripeRegistration;