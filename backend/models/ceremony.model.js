import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const Ceremony = sequelize.define(
    'Ceremony',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: false
        },
        year: {
            type: DataTypes.STRING(9),
            allowNull: false
        }
    },
    {
        tableName: 'ceremony',
        timestamps: false
    },
);

export default Ceremony;

// id = coluna Ceremony do CSV (numero da edicao, 1 a 98)
// year = coluna Year. Pode vir como intervalo: "1927/28"
