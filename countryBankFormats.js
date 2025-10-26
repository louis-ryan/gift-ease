export const COUNTRY_BANK_FORMATS = {
  US: {
    currency: 'usd',
    phonePrefix: '+1',
    bankFields: {
      routing_number: {
        required: true,
        label: 'Routing Number',
        placeholder: '123456789',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '000123456789',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'US',
      currency: 'usd',
      routing_number: bankAccount.routing_number,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  GB: {
    currency: 'gbp',
    phonePrefix: '+44',
    bankFields: {
      sort_code: {
        required: true,
        label: 'Sort Code',
        placeholder: '12-34-56',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '12345678',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'GB',
      currency: 'gbp',
      sort_code: bankAccount.sort_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  AU: {
    currency: 'aud',
    phonePrefix: '+61',
    bankFields: {
      bsb_number: {
        required: true,
        label: 'BSB Number',
        placeholder: '123-456',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '12345678',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'AU',
      currency: 'aud',
      bsb_number: bankAccount.bsb_number,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  DE: {
    currency: 'eur',
    phonePrefix: '+49',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'DE89370400440532013000',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'DE',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  CA: {
    currency: 'cad',
    phonePrefix: '+1',
    bankFields: {
      transit_number: {
        required: true,
        label: 'Transit Number',
        placeholder: '12345',
      },
      institution_number: {
        required: true,
        label: 'Institution Number',
        placeholder: '003',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '1234567890',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'CA',
      currency: 'cad',
      transit_number: bankAccount.transit_number,
      institution_number: bankAccount.institution_number,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  FR: {
    currency: 'eur',
    phonePrefix: '+33',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'FR1420041010050500013M02606',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'FR',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  IT: {
    currency: 'eur',
    phonePrefix: '+39',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'IT60X0542811101000000123456',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'IT',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  ES: {
    currency: 'eur',
    phonePrefix: '+34',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'ES9121000418450200051332',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'ES',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  NL: {
    currency: 'eur',
    phonePrefix: '+31',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'NL91ABNA0417164300',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'NL',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  BE: {
    currency: 'eur',
    phonePrefix: '+32',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'BE68539007547034',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'BE',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  AT: {
    currency: 'eur',
    phonePrefix: '+43',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'AT611904300234573201',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'AT',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  IE: {
    currency: 'eur',
    phonePrefix: '+353',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'IE64IRCE92099012345678',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'IE',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  FI: {
    currency: 'eur',
    phonePrefix: '+358',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'FI2112345600000785',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'FI',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  PT: {
    currency: 'eur',
    phonePrefix: '+351',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'PT50000201231234567890154',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'PT',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  GR: {
    currency: 'eur',
    phonePrefix: '+30',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'GR1601101250000000012300695',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'GR',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  SE: {
    currency: 'sek',
    phonePrefix: '+46',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'SE3550000000054910000003',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'SE',
      currency: 'sek',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  NO: {
    currency: 'nok',
    phonePrefix: '+47',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'NO9386011117947',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'NO',
      currency: 'nok',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  DK: {
    currency: 'dkk',
    phonePrefix: '+45',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'DK5000400440116243',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'DK',
      currency: 'dkk',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  CH: {
    currency: 'chf',
    phonePrefix: '+41',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'CH9300762011623852957',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'CH',
      currency: 'chf',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  PL: {
    currency: 'pln',
    phonePrefix: '+48',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'PL61109010140000071219812874',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'PL',
      currency: 'pln',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  CZ: {
    currency: 'czk',
    phonePrefix: '+420',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'CZ6508000000192000145399',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'CZ',
      currency: 'czk',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  HU: {
    currency: 'huf',
    phonePrefix: '+36',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'HU42117730161111101800000000',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'HU',
      currency: 'huf',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  RO: {
    currency: 'ron',
    phonePrefix: '+40',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'RO49AAAA1B31007593840000',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'RO',
      currency: 'ron',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  BG: {
    currency: 'bgn',
    phonePrefix: '+359',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'BG80BNBG96611020345678',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'BG',
      currency: 'bgn',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  HR: {
    currency: 'hrk',
    phonePrefix: '+385',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'HR1210010051863000160',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'HR',
      currency: 'hrk',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  SI: {
    currency: 'eur',
    phonePrefix: '+386',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'SI56263300012039086',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'SI',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  SK: {
    currency: 'eur',
    phonePrefix: '+421',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'SK3112000000198742637541',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'SK',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  LT: {
    currency: 'eur',
    phonePrefix: '+370',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'LT121000011101001000',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'LT',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  LV: {
    currency: 'eur',
    phonePrefix: '+371',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'LV80BANK0000435195001',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'LV',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  EE: {
    currency: 'eur',
    phonePrefix: '+372',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'EE382200221020145685',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'EE',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  MT: {
    currency: 'eur',
    phonePrefix: '+356',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'MT84MALT011000012345MTLCAST001S',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'MT',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  CY: {
    currency: 'eur',
    phonePrefix: '+357',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'CY17002001280000001200527600',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'CY',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  LU: {
    currency: 'eur',
    phonePrefix: '+352',
    bankFields: {
      iban: {
        required: true,
        label: 'IBAN',
        placeholder: 'LU280019400644750000',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'LU',
      currency: 'eur',
      account_number: bankAccount.iban,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  IN: {
    currency: 'inr',
    phonePrefix: '+91',
    bankFields: {
      ifsc_code: {
        required: true,
        label: 'IFSC Code',
        placeholder: 'SBIN0001234',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '12345678901',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'IN',
      currency: 'inr',
      ifsc_code: bankAccount.ifsc_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  CN: {
    currency: 'cny',
    phonePrefix: '+86',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '102100099996',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '1234567890123456',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'CN',
      currency: 'cny',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  RU: {
    currency: 'rub',
    phonePrefix: '+7',
    bankFields: {
      bik_code: {
        required: true,
        label: 'BIK Code',
        placeholder: '044525745',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '40702810123450123456',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'RU',
      currency: 'rub',
      bik_code: bankAccount.bik_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  BR: {
    currency: 'brl',
    phonePrefix: '+55',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '001',
      },
      agency_code: {
        required: true,
        label: 'Agency Code',
        placeholder: '1234',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '12345678',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'BR',
      currency: 'brl',
      bank_code: bankAccount.bank_code,
      agency_code: bankAccount.agency_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  JP: {
    currency: 'jpy',
    phonePrefix: '+81',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '0001',
      },
      branch_code: {
        required: true,
        label: 'Branch Code',
        placeholder: '001',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '1234567',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'JP',
      currency: 'jpy',
      bank_code: bankAccount.bank_code,
      branch_code: bankAccount.branch_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  KR: {
    currency: 'krw',
    phonePrefix: '+82',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '001',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '123456789012',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'KR',
      currency: 'krw',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  SG: {
    currency: 'sgd',
    phonePrefix: '+65',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '7171',
      },
      branch_code: {
        required: true,
        label: 'Branch Code',
        placeholder: '001',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '1234567890',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'SG',
      currency: 'sgd',
      bank_code: bankAccount.bank_code,
      branch_code: bankAccount.branch_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  HK: {
    currency: 'hkd',
    phonePrefix: '+852',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '004',
      },
      branch_code: {
        required: true,
        label: 'Branch Code',
        placeholder: '001',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '123456789',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'HK',
      currency: 'hkd',
      bank_code: bankAccount.bank_code,
      branch_code: bankAccount.branch_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  MX: {
    currency: 'mxn',
    phonePrefix: '+52',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '002',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '123456789012345678',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'MX',
      currency: 'mxn',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  AR: {
    currency: 'ars',
    phonePrefix: '+54',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '011',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '1234567890123456789012',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'AR',
      currency: 'ars',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  CL: {
    currency: 'clp',
    phonePrefix: '+56',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '001',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '12345678',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'CL',
      currency: 'clp',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  CO: {
    currency: 'cop',
    phonePrefix: '+57',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '001',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '12345678901234567890',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'CO',
      currency: 'cop',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  PE: {
    currency: 'pen',
    phonePrefix: '+51',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '002',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '12345678901234567890',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'PE',
      currency: 'pen',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  ZA: {
    currency: 'zar',
    phonePrefix: '+27',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '198765',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '1234567890',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'ZA',
      currency: 'zar',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  NG: {
    currency: 'ngn',
    phonePrefix: '+234',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '044',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '1234567890',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'NG',
      currency: 'ngn',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  EG: {
    currency: 'egp',
    phonePrefix: '+20',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '001',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '12345678901234567890',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'EG',
      currency: 'egp',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  TR: {
    currency: 'try',
    phonePrefix: '+90',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '12',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '12345678901234567890',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'TR',
      currency: 'try',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  IL: {
    currency: 'ils',
    phonePrefix: '+972',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '012',
      },
      branch_code: {
        required: true,
        label: 'Branch Code',
        placeholder: '001',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '123456789',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'IL',
      currency: 'ils',
      bank_code: bankAccount.bank_code,
      branch_code: bankAccount.branch_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  SA: {
    currency: 'sar',
    phonePrefix: '+966',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '10',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '12345678901234567890',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'SA',
      currency: 'sar',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
  AE: {
    currency: 'aed',
    phonePrefix: '+971',
    bankFields: {
      bank_code: {
        required: true,
        label: 'Bank Code',
        placeholder: '001',
      },
      account_number: {
        required: true,
        label: 'Account Number',
        placeholder: '12345678901234567890',
      },
    },
    createExternalAccount: (bankAccount) => ({
      object: 'bank_account',
      country: 'AE',
      currency: 'aed',
      bank_code: bankAccount.bank_code,
      account_number: bankAccount.account_number,
      account_holder_name: bankAccount.account_holder_name,
      account_holder_type: 'individual',
    }),
  },
};
