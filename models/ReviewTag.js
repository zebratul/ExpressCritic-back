const { Model } = require('sequelize');

class ReviewTag extends Model {
    static init(sequelize) {
        super.init({}, {
            sequelize,
            modelName: 'ReviewTag',
            timestamps: false,
            underscored: true,
        });
    }

  static associate(models) {
      this.belongsTo(models.Review, { foreignKey: 'review_id' });
      this.belongsTo(models.Tag, { foreignKey: 'tag_id' });
  }
}

module.exports = { ReviewTag };
