const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
    sequelize.define("profile", {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        mail: {
            type: DataTypes.STRING,
            uniq: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        services: {
            type: DataTypes.STRING,
            allowNull: true,

        },

        birthday: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        identification: {
            type: DataTypes.INTEGER,
            allowNull: false,
            uniq: true
        },
        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }

    });
};
