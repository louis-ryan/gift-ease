import dbConnect from '../../utils/dbConnect';
import Account from '../../models/Account';

dbConnect();

export default async (req, res) => {
    const { query: { user } } = req;
    
    try {
        const accountStatus = {
            isEnabled: req.body.isEnabled,
            isDetailsSubmitted: req.body.isDetailsSubmitted,
            payoutsEnabled: req.body.payoutsEnabled
        };

        const account = await Account.findOneAndUpdate(
            { user: user },
            { 
                $set: { 
                    stripeAccountStatus: accountStatus
                } 
            },
            { 
                new: true
            }
        );

        if (!account) {
            return res.status(404).json({ 
                success: false, 
                message: "Account not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: account, 
            message: "Account status updated successfully" 
        });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(400).json({ 
            success: false, 
            message: "Failed to update account status" 
        });
    }
}