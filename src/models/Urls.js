const Sequelize = require('sequelize');
const db = require('../config/db');

const Urls = db.define('urls', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    url: Sequelize.STRING(450),
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
});


module.exports = Urls;