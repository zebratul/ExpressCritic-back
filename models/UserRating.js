const { Model, DataTypes } = require('sequelize');

class UserRating extends Model {
    static init(sequelize) {
        super.init({
            rating: DataTypes.INTEGER,
        }, {
            sequelize,
            modelName: 'UserRating',
            timestamps: true,
            underscored: true,
        });
    }

    static associate(models) {
        this.belongsTo(models.RevyUser, { foreignKey: 'user_id', as: 'user' });
        this.belongsTo(models.ArtPiece, { foreignKey: 'art_piece_id', as: 'art_piece' });
    }
}

module.exports = { UserRating };
