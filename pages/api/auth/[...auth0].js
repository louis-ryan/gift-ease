import { handleAuth, handleCallback, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

export default handleAuth({
  async callback(req, res) {
    try {
      await handleCallback(req, res, {
        redirectUri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
        postLoginRedirect: '/'
      });

      console.log('Callback completed successfully');
      console.log('Redirecting to:', '/');
    } catch (error) {
      console.error('Auth0 callback error:', error);
      res.status(error.status || 500).end(error.message);
    }
  },
  async login(req, res) {
    try {
      console.log('Login initiated');
      await handleLogin(req, res, {
        authorizationParams: {
          redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
        },
      });
      console.log('Login handled successfully');
    } catch (error) {
      console.error('Auth0 login error:', error);
      res.status(error.status || 500).end(error.message);
    }
  },
  // Add the custom logout handler
  async logout(req, res) {
    try {
      console.log('Logout initiated');
      // Use the specific Canva site preview URL
      const returnToUrl = 'https://wishlistagogo.com/';
      console.log('Attempting to redirect to:', returnToUrl);
      
      await handleLogout(req, res, {
        returnTo: returnToUrl
      });
      console.log('Logout handled successfully');
    } catch (error) {
      console.error('Auth0 logout error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      // Provide a fallback redirect in case of error
      res.writeHead(302, { Location: '/' });
      res.end();
    }
  }
});