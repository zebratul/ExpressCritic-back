const { OAuth2Client } = require('google-auth-library');
const AuthHelper = require('./authHelper');

class GoogleAuth {
  constructor(clientId) {
    this.client = new OAuth2Client(clientId);
  }

  async verify(tokenId) {
    const ticket = await this.client.verifyIdToken({
      idToken: tokenId,
      audience: this.client._clientId,
    });
    return ticket.getPayload();
  }

  async authenticate(tokenId) {
    console.log("recieved an google login attempt...");
    const payload = await this.verify(tokenId);
    const user = await AuthHelper.findOrCreateUser(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        picture: user.picture,
      },
    };
  }
}

module.exports = GoogleAuth;
