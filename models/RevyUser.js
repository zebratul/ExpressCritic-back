const { Model, DataTypes } = require('sequelize');

class RevyUser extends Model {
    static init(sequelize) {
        super.init({
            username: { type: DataTypes.STRING, unique: true },
            email: { type: DataTypes.STRING, unique: true },
            password_hash: DataTypes.STRING,
            is_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
            picture: DataTypes.STRING, 
        }, {
            sequelize,
            modelName: 'RevyUser',
            timestamps: true,
            underscored: true,
        });
    }

  static associate(models) {
      this.hasMany(models.Review, { foreignKey: 'user_id', as: 'reviews' });
      this.hasMany(models.Comment, { foreignKey: 'user_id', as: 'comments' });
      this.belongsToMany(models.Review, { through: 'ReviewLikes', as: 'liked_reviews', foreignKey: 'user_id' });
      this.belongsToMany(models.Comment, { through: 'CommentLikes', as: 'liked_comments', foreignKey: 'user_id' });
      this.hasMany(models.UserRating, { foreignKey: 'user_id', as: 'ratings' });
  }
}

module.exports = { RevyUser };
