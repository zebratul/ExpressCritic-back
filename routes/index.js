const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const reviewRoutes = require('./reviewRoutes');
const artPieceRoutes = require('./artPieceRoutes');
const tagRoutes = require('./tagRoutes');
const searchRoutes = require('./searchRoutes'); 

router.use('/', authRoutes);
router.use('/reviews', reviewRoutes);
router.use('/artpieces', artPieceRoutes);
router.use('/tags', tagRoutes);
router.use('/', searchRoutes);

module.exports = router;
