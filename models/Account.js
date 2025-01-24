const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: String,
    stripeAccountId: String,
    user: {
        type: String,
        required: true,
        unique: false,
        index: false
    },
    currentEventStr: {
        type: String,
        required: false,
    },
    accountSetupComplete: Boolean
}, { timestamps: true })

module.exports = mongoose.models.Account || mongoose.model('Account', AccountSchema);