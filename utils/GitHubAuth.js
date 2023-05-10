const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

class GitHubAuth {
  static async authenticate(code) {
    try {
      const clientID = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      const params = '?client_id=' + clientID + '&client_secret=' + clientSecret + '&code=' + code;

      const tokenResponse = await fetch("https://github.com/login/oauth/access_token" + params, {
        method: "POST",
        headers: {
          "Accept": "application/json"
        }
      });
      const tokenData = await tokenResponse.json();
      const access_token = tokenData.access_token;

      const userResponse = await fetch("https://api.github.com/user", {
        method: "GET",
        headers: {
          "Authorization": "token " + access_token
        }
      });
      const userData = await userResponse.json();
      if (userData.message === 'Bad credentials') {
        throw new Error('Bad credentials');
      }

      const emailResponse = await fetch("https://api.github.com/user/emails", {
        method: "GET",
        headers: {
          "Authorization": "token " + access_token
        }
      });
      const emailData = await emailResponse.json();

      console.log("email data",emailData);
      if (emailData.message === 'Bad credentials') {
        throw new Error('Bad credentials');
      }

      const primaryEmail = emailData.find(email => email.primary);

      userData.email = primaryEmail.email; 

      const user = {
        id: userData.id,
        username: userData.login,
        email: userData.email,
        picture: userData.avatar_url,
      };

      return { user };
    } catch (error) {
      console.error('GitHub Sign-In error:', error);
      throw error;
    }
  }
}

module.exports = GitHubAuth;
