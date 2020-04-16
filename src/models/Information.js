const Sequelize = require('sequelize');
const db = require('../config/db');
const Subdomains = require('./Subdomains');

const Information = db.define('information', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    address: Sequelize.STRING(150),
});


Information.belongsTo(Subdomains);

module.exports = Information;