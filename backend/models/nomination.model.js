import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const Nomination = sequelize.define(
    'Nomination',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ceremony_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        category_label: {
            type: DataTypes.STRING(120),
            allowNull: false
        },
        winner: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        citation: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        tableName: 'nomination',
        timestamps: false
    },
);

export default Nomination;

// category_label = coluna Category, o rotulo usado naquele ano (130 variacoes)
// winner = coluna Winner, que no CSV vem como "True" ou vazio
