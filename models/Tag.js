const { Model, DataTypes } = require('sequelize');

class Tag extends Model {
    static init(sequelize) {
        super.init({
            name: { type: DataTypes.STRING, unique: true },
        }, {
            sequelize,
            modelName: 'Tag',
            timestamps: true,
            underscored: true,
        });
    }

  static associate(models) {
      this.belongsToMany(models.Review, { through: models.ReviewTag, as: 'reviews', foreignKey: 'tag_id' });
  }
}

module.exports = { Tag };
