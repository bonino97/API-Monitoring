const { Router } = require('express');
const router = Router();
const indexController = require('../controllers/index.controller');

router.get('/subdomains', indexController.getSubdomains);

router.get('/all', indexController.getAllSubdomains);

router.get('/test', indexController.test);

module.exports = router;