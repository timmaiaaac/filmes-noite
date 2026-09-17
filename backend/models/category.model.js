import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const Category = sequelize.define(
    'Category',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true
        },
        class: {
            type: DataTypes.ENUM(
                'Acting',
                'Directing',
                'Music',
                'Production',
                'SciTech',
                'Special',
                'Title',
                'Writing'
            ),
            allowNull: false
        }
    },
    {
        tableName: 'category',
        timestamps: false
    },
);

export default Category;

// name = coluna CanonicalCategory (66 valores padronizados)
// class = coluna Class, o grupo da categoria
