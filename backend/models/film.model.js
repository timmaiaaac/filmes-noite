import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const Film = sequelize.define(
    'Film',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        imdb_id: {
            type: DataTypes.STRING(12),
            allowNull: true,
            unique: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    },
    {
        tableName: 'film',
        timestamps: false
    },
);

export default Film;

// imdb_id = coluna FilmId, formato tt0019217
// title = coluna Film
