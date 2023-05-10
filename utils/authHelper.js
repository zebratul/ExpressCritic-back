const { RevyUser } = require('../models/RevyUser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Indexer = require('./indexer');
const indexer = new Indexer();

class AuthHelper {
  static async findOrCreateUser(payload) {
    const email = payload.email;
  
    let user = await RevyUser.findOne({
      where: { email },
    });
  
    if (user) {
      if (user.picture !== payload.picture) {
        user = await user.update({ picture: payload.picture });
      }
    } else {
      user = await RevyUser.create({
        email,
        username: payload.name,
        picture: payload.picture,
        password_hash: '',
      });

      indexer.indexNewData('revy_users', user.id, {
        username: user.username,
        email: user.email,
      });
    }
  
    return user;
  }

  static generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: '1d' };

    return jwt.sign(payload, secret, options);
  }
}

module.exports = AuthHelper;
