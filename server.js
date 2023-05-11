const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const routes = require('./routes');
const { sequelize } = require('./models');

class Server {
  constructor() {
    this.app = express();
    this.initMiddlewares();
    this.initDatabase();
    this.initRoutes();
  }

  initMiddlewares() {
    this.app.use(cors({ origin: 'https://ec-prod-bwvc.vercel.app', credentials: true }));
    this.app.use(express.json());
    this.app.use(cookieParser(process.env.COOKIE_SECRET));
  }

  async initDatabase() {
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      await sequelize.sync();
      console.log('Database sync complete.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }

  initRoutes() {
    this.app.use('/api', routes);
  }

  start(port) {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}

const server = new Server();
const port = process.env.PORT || 5000;
server.start(port);
