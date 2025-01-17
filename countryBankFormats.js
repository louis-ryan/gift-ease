export const COUNTRY_BANK_FORMATS = {
    US: {
        currency: 'usd',
        phonePrefix: '+1',
        bankFields: {
            routing_number: {
                required: true,
                label: 'Routing Number',
                placeholder: '123456789'
            },
            account_number: {
                required: true,
                label: 'Account Number',
                placeholder: '000123456789'
            }
        },
        createExternalAccount: (bankAccount) => ({
            object: 'bank_account',
            country: 'US',
            currency: 'usd',
            routing_number: bankAccount.routing_number,
            account_number: bankAccount.account_number,
            account_holder_name: bankAccount.account_holder_name,
            account_holder_type: 'individual'
        })
    },
    GB: {
        currency: 'gbp',
        phonePrefix: '+44',
        bankFields: {
            sort_code: {
                required: true,
                label: 'Sort Code',
                placeholder: '12-34-56'
            },
            account_number: {
                required: true,
                label: 'Account Number',
                placeholder: '12345678'
            }
        },
        createExternalAccount: (bankAccount) => ({
            object: 'bank_account',
            country: 'GB',
            currency: 'gbp',
            sort_code: bankAccount.sort_code,
            account_number: bankAccount.account_number,
            account_holder_name: bankAccount.account_holder_name,
            account_holder_type: 'individual'
        })
    },
    AU: {
        currency: 'aud',
        phonePrefix: '+61',
        bankFields: {
            bsb_number: {
                required: true,
                label: 'BSB Number',
                placeholder: '123-456'
            },
            account_number: {
                required: true,
                label: 'Account Number',
                placeholder: '12345678'
            }
        },
        createExternalAccount: (bankAccount) => ({
            object: 'bank_account',
            country: 'AU',
            currency: 'aud',
            bsb_number: bankAccount.bsb_number,
            account_number: bankAccount.account_number,
            account_holder_name: bankAccount.account_holder_name,
            account_holder_type: 'individual'
        })
    },
    DE: {
        currency: 'eur',
        phonePrefix: '+49',
        bankFields: {
            iban: {
                required: true,
                label: 'IBAN',
                placeholder: 'DE89370400440532013000'
            }
        },
        createExternalAccount: (bankAccount) => ({
            object: 'bank_account',
            country: 'DE',
            currency: 'eur',
            account_number: bankAccount.iban,
            account_holder_name: bankAccount.account_holder_name,
            account_holder_type: 'individual'
        })
    }
};