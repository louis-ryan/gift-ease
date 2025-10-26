import dbConnect from '../../../utils/dbConnect';
import Account from '../../../models/Account';

dbConnect();

export default async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const {
    query: { user },
  } = req;

  const userSub = user.split('||')[0];
  const userEmail = user.split('||')[1];

  try {
    const account = await Account.findOne({ user: userSub });

    if (!account) {
      const newAccount = await Account.create({
        user: userSub,
        email: userEmail,
        currentEventStr: '',
        accountSetupComplete: false,
        currency: 'USD',
      });

      res
        .status(201)
        .json({
          success: true,
          data: newAccount,
          message: 'No account was found, one has been created.',
        });
      return;
    }

    res
      .status(200)
      .json({
        success: true,
        data: account,
        message: 'Your account has been found.',
      });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};
