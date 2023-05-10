const { Sequelize } = require('sequelize');
const { RevyUser } = require('./RevyUser');
const { Category } = require('./Category');
const { ArtPiece } = require('./ArtPiece');
const { Tag } = require('./Tag');
const { Review } = require('./Review');
const { Comment } = require('./Comment');
const { UserRating } = require('./UserRating');
const { ReviewTag } = require('./ReviewTag');
const { CommentLikes } = require('./CommentLikes');
const { ReviewLikes } = require('./ReviewLikes');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    define: {
        timestamps: true,
        underscored: true,
    },
    logging: (query, ms) => {
        if (ms > 100) {
            console.log(`${query} (${ms}ms)`);
        }
      },
});

RevyUser.init(sequelize);
Category.init(sequelize);
ArtPiece.init(sequelize);
Tag.init(sequelize);
Review.init(sequelize);
Comment.init(sequelize);
UserRating.init(sequelize);
ReviewTag.init(sequelize);
CommentLikes.init(sequelize);
ReviewLikes.init(sequelize);

RevyUser.associate(sequelize.models);
Category.associate(sequelize.models);
ArtPiece.associate(sequelize.models);
Tag.associate(sequelize.models);
Review.associate(sequelize.models);
Comment.associate(sequelize.models);
UserRating.associate(sequelize.models);
ReviewTag.associate(sequelize.models);
CommentLikes.associate(sequelize.models);
ReviewLikes.associate(sequelize.models);

module.exports = {
    sequelize,
    RevyUser,
    Category,
    ArtPiece,
    Tag,
    Review,
    Comment,
    UserRating,
    ReviewTag,
    CommentLikes,
    ReviewLikes
};