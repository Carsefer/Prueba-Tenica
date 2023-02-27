const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
    sequelize.define("order", {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        observation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        healthCondition: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        service: {
            type: DataTypes.STRING,
            allowNull: false,

        },
        hospital: {
            type: DataTypes.STRING,
            allowNull: false
        }

    });
};
