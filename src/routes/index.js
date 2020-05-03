const { Router } = require('express');
const router = Router();
const indexController = require('../controllers/indexController');

router.get('/Enumeration', indexController.SubdomainEnumeration);
router.get('/Monitoring', indexController.ExecuteMonitoring);
router.get('/Takeover', indexController.SubdomainTakeover);

router.get('/', indexController.Welcome);
router.get('/Test', indexController.test);

module.exports = router;