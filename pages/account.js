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
  renderBankInfo,
} from '../components/OnboardingForm';
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
      account_holder_name: '',
    },
  });
  const [transactionData, setTransactionData] = useState({
    available_balance: [],
    pending_balance: [],
    pending_payouts: [],
    recent_transfers: [],
  });

  const { user } = useUser();

  const router = useRouter();

  const getFormattedPhone = (formData) => {
    const prefix = COUNTRY_BANK_FORMATS[formData.country]?.phonePrefix || '';
    const cleanPhone = formData.phone.replace(prefix, '');
    return `${prefix}${cleanPhone}`;
  };

  const getTransactionData = async (accountId) => {
    try {
      const res = await fetch(
        `/api/getStripePaymentsForAccount?accountId=${accountId}`,
        {
          method: 'GET',
          credentials: 'include', // Important for CORS with credentials
          headers: {
            'Content-Type': 'application/json',
            // No need to explicitly set Origin as browser will do this
          },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const { payments } = await res.json();
      setTransactionData(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const checkOnboardingStatus = async (accountId) => {
    const accountRes = await fetch(
      `/api/checkOnboardingStatus?id=${accountId}`,
      {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
    const onboardingData = await accountRes.json();
    props.setOnboardingData(onboardingData);
  };

  const setAccountId = async (accountId) => {
    try {
      await fetch(`/api/setAccountId?id=${props.stripeUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        body: JSON.stringify({
          stripeAccountId: accountId,
        }),
      });
    } catch (error) {
      console.error('Error setting stripe user account id in Mongo:', error);
    }
  };

  const setPaymentSetupComplete = async (userId) => {
    try {
      const accountRes = await fetch(
        `/api/setPaymentSetupComplete?id=${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
      const { data } = await accountRes.json();
      props.setAccountSetupComplete(data.accountSetupComplete);
    } catch (error) {
      console.error('Error setting setup complete value:', error);
    }
  };

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
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else if (name === 'country') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        bankAccount: {
          account_holder_name: prev.bankAccount.account_holder_name,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBankAccountChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [name]: value,
      },
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
          phone: getFormattedPhone(formData),
        }),
      });

      const data = await response.json();

      if (data.success) {
        props.setAccountId(data.accountId);
        setAccountId(data.accountId);
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
    if (!router) return;
    if (!router.query.setup) return;
    if (!props.stripeUserId) return;
    setPaymentSetupComplete(props.stripeUserId);
  }, [router, props.stripeUserId]);

  useEffect(() => {
    if (!user) return;
    getOrCreateNewAccount(
      user.sub,
      user.email,
      props.setCurrentEvent,
      props.setAccountId,
      props.setStripeUserId,
      props.setModalOpen,
      props.setNotes,
      props.setAccountSetupComplete,
      props.setSelectedCurrency
    );
    setFormData({ ...formData, email: user.email });
  }, [user]);

  useEffect(() => {
    if (!props.accountId) return;
    checkOnboardingStatus(props.accountId);
    getTransactionData(props.accountId);
  }, [props.accountId]);

  if (!props.currentEvent) return;
  if (!user) return;
  return (
    <div className="container">
      <div className="account-container">
        <div className="back-link">
          <Link href={'/'}>
            <div className="back-button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5M12 19L5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Back to Dashboard</span>
            </div>
          </Link>
        </div>

        {props.accountSetupComplete ? (
          <div className="account-content">
            <div className="account-header">
              <h1 className="account-title">Account Dashboard</h1>
              <p className="account-subtitle">
                Manage your payments and account settings
              </p>
            </div>
            <BalanceDashboard data={transactionData} />
          </div>
        ) : (
          <div className="setup-content">
            {!props.onboardingData.isDetailsSubmitted ? (
              <div className="setup-step">
                <div className="setup-header">
                  <div className="step-indicator">
                    <div className="step-number">1</div>
                    <div className="step-info">
                      <div className="step-label">Step 1 of 2</div>
                      <div className="step-title">Account Verification</div>
                    </div>
                  </div>
                  <div className="setup-description">
                    <p>
                      To ensure secure payments and comply with financial
                      regulations, we need to verify your identity. This
                      information is encrypted and protected by Stripe's
                      bank-level security.
                    </p>
                  </div>
                </div>

                <div className="form-container">
                  {error && <div className="error-message">{error}</div>}
                  <form onSubmit={handleSubmit} className="setup-form">
                    {step &&
                      renderPersonalInfo(formData, handleInputChange, setStep)}
                    {step &&
                      renderBankInfo(
                        formData,
                        handleBankAccountChange,
                        setStep,
                        loading
                      )}
                  </form>
                </div>

                <div className="security-notice">
                  <div className="security-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 12L11 14L15 10"
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="security-text">
                    <strong>Bank-level security</strong> - Your data is
                    encrypted and protected by Stripe's enterprise-grade
                    security infrastructure.
                  </div>
                </div>
              </div>
            ) : (
              <div className="setup-step">
                <div className="setup-header">
                  <div className="step-indicator">
                    <div className="step-number">2</div>
                    <div className="step-info">
                      <div className="step-label">Step 2 of 2</div>
                      <div className="step-title">Complete Setup</div>
                    </div>
                  </div>
                  <div className="setup-description">
                    <p>
                      Almost done! Complete your Stripe account setup to start
                      receiving payments for your wishes.
                    </p>
                  </div>
                </div>
                <CreatePayoutLink accountId={props.accountId} />
              </div>
            )}
          </div>
        )}

        <style jsx>{`
          .account-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          .back-link {
            margin-bottom: 32px;
          }

          .back-button {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .back-button:hover {
            color: #374151;
          }

          .account-content {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow:
              0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .account-header {
            margin-bottom: 32px;
          }

          .account-title {
            font-size: 32px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
          }

          .account-subtitle {
            font-size: 16px;
            color: #6b7280;
            margin: 0;
          }

          .setup-content {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow:
              0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .setup-step {
            max-width: 600px;
          }

          .setup-header {
            margin-bottom: 32px;
          }

          .step-indicator {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
          }

          .step-number {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 16px;
          }

          .step-info {
            flex: 1;
          }

          .step-label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .step-title {
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin: 0;
          }

          .setup-description {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
          }

          .setup-description p {
            margin: 0;
            color: #475569;
            font-size: 14px;
            line-height: 1.6;
          }

          .form-container {
            margin-bottom: 32px;
          }

          .setup-form {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
          }

          .error-message {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
          }

          .security-notice {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 16px;
          }

          .security-icon {
            flex-shrink: 0;
            margin-top: 2px;
          }

          .security-text {
            font-size: 14px;
            color: #166534;
            line-height: 1.5;
          }

          @media (max-width: 640px) {
            .account-container {
              padding: 20px 16px;
            }

            .setup-content,
            .account-content {
              padding: 24px;
            }

            .step-indicator {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }

            .step-title {
              font-size: 20px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default StripeRegistration;
