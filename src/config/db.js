const Sequelize = require('sequelize')



module.exports = new Sequelize('Monitoring','postgres','ROOT',{
    host: '127.0.0.1',
    port: '5432',
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false,
    define: {   
        timestamps: false
    }
});