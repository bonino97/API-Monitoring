const Sequelize = require('sequelize');
const db = require('../config/db');
const Subdomains = require('./Subdomains');

const Headers = db.define('headers', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: Sequelize.STRING(32767),
    value: Sequelize.STRING(32767)
});


Headers.belongsTo(Subdomains);

module.exports = Headers;