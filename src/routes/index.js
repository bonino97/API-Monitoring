const { Router } = require('express');
const router = Router();
const indexController = require('../controllers/indexController');

router.post('/Findomain', indexController.FindomainMonitoring);
router.get('/Findomain', indexController.FindomainSubdomains);

router.get('/Enumeration', indexController.SubdomainEnumeration);
router.get('/Monitoring', indexController.ExecuteMonitoring);

router.get('/test', indexController.test);

module.exports = router;