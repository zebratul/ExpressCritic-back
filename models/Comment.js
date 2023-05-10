const { Model, DataTypes } = require('sequelize');

class Comment extends Model {
    static init(sequelize) {
        super.init({
            text: DataTypes.TEXT,
        }, {
            sequelize,
            modelName: 'Comment',
            timestamps: true,
            underscored: true,
        });
    }

    static associate(models) {
        this.belongsTo(models.RevyUser, { foreignKey: 'user_id', as: 'author' });
        this.belongsTo(models.Review, { foreignKey: 'review_id', as: 'review' });
        this.belongsToMany(models.RevyUser, { through: 'CommentLikes', as: 'liked_by_users', foreignKey: 'comment_id' });
    }
}

module.exports = { Comment };
