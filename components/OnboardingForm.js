import { COUNTRY_BANK_FORMATS } from '../countryBankFormats';

console.log("country bank formats: ", COUNTRY_BANK_FORMATS)

const PhoneInput = ({ country, value, onChange }) => {
    const prefix = COUNTRY_BANK_FORMATS[country]?.phonePrefix || '';

    const handleChange = (e) => {
        let newValue = e.target.value;
        if (newValue.startsWith(prefix)) {
            newValue = newValue.slice(prefix.length);
        }
        newValue = newValue.replace(/[^\d+]/g, '');
        onChange(newValue);
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666'
            }}>
                {prefix}
            </div>
            <input
                type="tel"
                value={value}
                onChange={handleChange}
                style={{ paddingLeft: `${prefix.length * 10 + 8}px` }}
                placeholder="Phone number"
            />
        </div>
    );
};

export const renderPersonalInfo = (formData, handleInputChange, setStep) => (
    <div className="form-section">
        <div className="form-group">
            <label>Country</label>
            <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
            >
                {Object.keys(COUNTRY_BANK_FORMATS).map(country => (
                    <option key={country} value={country}>
                        {country}
                    </option>
                ))}
            </select>
        </div>
        <div className="form-group">
            <label>Email</label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
            />
        </div>
        <div className="form-group">
            <label>Phone</label>
            <PhoneInput
                country={formData.country}
                value={formData.phone}
                onChange={(value) => handleInputChange({
                    target: {
                        name: 'phone',
                        value: value
                    }
                })}
            />
        </div>
        <button type="button" onClick={() => setStep(2)}>Next</button>
    </div>
);

export const renderAddress = (formData, handleInputChange, setStep) => (
    <div className="form-section">
        <div className="form-group">
            <label>Address</label>
            <input
                type="text"
                name="address.line1"
                value={formData.address.line1}
                onChange={handleInputChange}
                required
            />
        </div>
        <div className="form-group">
            <label>City</label>
            <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                required
            />
        </div>
        <div className="form-group">
            <label>State</label>
            <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                required
            />
        </div>
        <div className="form-group">
            <label>Postal Code</label>
            <input
                type="text"
                name="address.postal_code"
                value={formData.address.postal_code}
                onChange={handleInputChange}
                required
            />
        </div>
        <div className="button-group">
            <button type="button" onClick={() => setStep(1)}>Back</button>
            <button type="button" onClick={() => setStep(3)}>Next</button>
        </div>
    </div>
);

export const renderDOB = (formData, handleInputChange, setStep) => (
    <div className="form-section">
        <div className="form-group">
            <label>Date of Birth</label>
            <div className="dob-inputs">
                <input
                    type="number"
                    name="dob.month"
                    placeholder="MM"
                    value={formData.dob.month}
                    onChange={handleInputChange}
                    min="1"
                    max="12"
                    required
                />
                <input
                    type="number"
                    name="dob.day"
                    placeholder="DD"
                    value={formData.dob.day}
                    onChange={handleInputChange}
                    min="1"
                    max="31"
                    required
                />
                <input
                    type="number"
                    name="dob.year"
                    placeholder="YYYY"
                    value={formData.dob.year}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear() - 18}
                    required
                />
            </div>
        </div>
        <div className="button-group">
            <button type="button" onClick={() => setStep(2)}>Back</button>
            <button type="button" onClick={() => setStep(4)}>Next</button>
        </div>
    </div>
);

export const renderBankInfo = (formData, handleBankAccountChange, setStep, loading) => {
    const countryConfig = COUNTRY_BANK_FORMATS[formData.country];
    return (
        <div className="form-section">
            <div className="form-group">
                <label>Account Holder Name</label>
                <input
                    type="text"
                    name="account_holder_name"
                    value={formData.bankAccount.account_holder_name}
                    onChange={handleBankAccountChange}
                    required
                />
            </div>

            {Object.entries(countryConfig.bankFields).map(([fieldName, fieldConfig]) => (
                <div key={fieldName} className="form-group">
                    <label>{fieldConfig.label}</label>
                    <input
                        type="text"
                        name={fieldName}
                        value={formData.bankAccount[fieldName] || ''}
                        onChange={handleBankAccountChange}
                        placeholder={fieldConfig.placeholder}
                        required={fieldConfig.required}
                    />
                </div>
            ))}

            <div className="button-group">
                <button type="button" onClick={() => setStep(3)}>Back</button>
                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Complete Setup'}
                </button>
            </div>
        </div>
    );
};
