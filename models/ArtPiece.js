const { Model, DataTypes } = require('sequelize');

class ArtPiece extends Model {
    static init(sequelize) {
        super.init({
            name: { type: DataTypes.STRING },
            release_date: DataTypes.INTEGER
        }, {
            sequelize,
            modelName: 'ArtPiece',
            timestamps: true,
            underscored: true,
        });
    }

    static associate(models) {
        this.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
        this.hasMany(models.Review, { foreignKey: 'art_piece_id', as: 'reviews' });
    }
}

module.exports = { ArtPiece };
