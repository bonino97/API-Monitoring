const Sequelize = require('sequelize');
const db = require('../config/db');
const Subdomains = require('./Subdomains');

const Stacks = db.define('stacks', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stackName: Sequelize.STRING(450),
});


Stacks.belongsTo(Subdomains);

module.exports = Stacks;