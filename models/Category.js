const { Model, DataTypes } = require('sequelize');

class Category extends Model {
    static init(sequelize) {
        super.init({
            name: { type: DataTypes.STRING, unique: true },
        }, {
            sequelize,
            modelName: 'Category',
            timestamps: true,
            underscored: true,
        });
      }

      static associate(models) {
          this.hasMany(models.ArtPiece, { foreignKey: 'category_id', as: 'art_pieces' });
      }
}

module.exports = { Category };
