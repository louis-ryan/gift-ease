// In your checkOnboardingStatus.js API route
try {
    const { accountId } = req.query;
    const account = await stripe.accounts.retrieve(accountId, {
        expand: ['requirements.currently_due', 'requirements.past_due', 'requirements.eventually_due']
    });

    res.status(200).json({
        isEnabled: account.charges_enabled,
        isDetailsSubmitted: account.details_submitted,
        payoutsEnabled: account.payouts_enabled,
        requirements: {
            currentlyDue: account.requirements?.currently_due || [],
            pendingVerification: account.requirements?.pending_verification || [],
            eventuallyDue: account.requirements?.eventually_due || [],
            disabled_reason: account.requirements?.disabled_reason,
            current_deadline: account.requirements?.current_deadline,
            past_due: account.requirements?.past_due || [],
            errors: account.requirements?.errors || []
        },
        capabilities: account.capabilities,
        verification: {
            status: account.verification?.status,
            fields_needed: account.verification?.fields_needed || []
        },
        restricted_reason: account.requirements?.disabled_reason
    });
} catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error checking onboarding status' });
}