import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const Person = sequelize.define(
    'Person',
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
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    },
    {
        tableName: 'person',
        timestamps: false
    },
);

export default Person;

// imdb_id = coluna NomineeIds, formato nm0001932
// nulo em 527 linhas: premios honorarios e empresas nas categorias SciTech
// name = coluna Nominees
