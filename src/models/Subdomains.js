const Sequelize = require('sequelize');
const db = require('../config/db');

const Subdomains = db.define('subdomains', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    url: {
        type: Sequelize.STRING(150),
        allowNull: false
    },
    statusCode: Sequelize.STRING(5),
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
});

module.exports = Subdomains;

