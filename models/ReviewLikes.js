const { Model } = require('sequelize');

class ReviewLikes extends Model {
    static init(sequelize) {
        super.init({}, {
            sequelize,
            modelName: 'ReviewLikes',
            timestamps: false,
            underscored: true,
        });
  }

  static associate(models) {
      this.belongsTo(models.RevyUser, { foreignKey: 'user_id' });
      this.belongsTo(models.Review, { foreignKey: 'review_id' });
    }
}

module.exports = { ReviewLikes };
