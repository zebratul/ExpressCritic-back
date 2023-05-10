const { Model, DataTypes } = require('sequelize');

class Review extends Model {
    static init(sequelize) {
        super.init({
            review_name: DataTypes.STRING,
            review_text: DataTypes.TEXT,
            image_url: DataTypes.STRING,
            grade: DataTypes.FLOAT,
        }, {
            sequelize,
            modelName: 'Review',
            timestamps: true,
            underscored: true,
        });
  }

  static associate(models) {
      this.belongsTo(models.RevyUser, { foreignKey: 'user_id', as: 'author' });
      this.belongsTo(models.ArtPiece, { foreignKey: 'art_piece_id', as: 'art_piece' });
      this.belongsToMany(models.Tag, { through: models.ReviewTag, as: 'tags', foreignKey: 'review_id' });

      this.hasMany(models.Comment, { foreignKey: 'review_id', as: 'comments' });
      this.belongsToMany(models.RevyUser, { through: 'ReviewLikes', as: 'liked_by_users', foreignKey: 'review_id' });
      this.hasMany(models.UserRating, { foreignKey: 'review_id', as: 'ratings' });
  }
}

module.exports = { Review };
