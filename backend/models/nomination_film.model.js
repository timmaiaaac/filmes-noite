import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const NominationFilm = sequelize.define(
    'NominationFilm',
    {
        nomination_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        film_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        detail: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        tableName: 'nomination_film',
        timestamps: false
    },
);

export default NominationFilm;

// detail = coluna Detail: personagem interpretado ou nome da cancao.
// Sempre relativo a este filme, por isso mora aqui e nao na juncao com Person
