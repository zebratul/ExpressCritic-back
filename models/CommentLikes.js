const { Model } = require('sequelize');

class CommentLikes extends Model {
    static init(sequelize) {
        super.init({}, {
            sequelize,
            modelName: 'CommentLikes',
            timestamps: false,
            underscored: true,
        });
    }

    static associate(models) {
        this.belongsTo(models.RevyUser, { foreignKey: 'user_id' });
        this.belongsTo(models.Comment, { foreignKey: 'comment_id' });
    }
}

module.exports = { CommentLikes };
