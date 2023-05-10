const express = require('express');
const router = express.Router();
const { ArtPiece } = require('../models');
const { checkAuth } = require('../middlewares/checkAuth');

router.get('/', checkAuth, async (req, res) => {
    try {
        const artPieces = await ArtPiece.findAll();
        res.json(artPieces);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Art Pieces', error });
    }
    });

router.post('/', checkAuth, async (req, res) => {
    const { name, release_date, category_id } = req.body;

    try {
        const newArtPiece = await ArtPiece.create({ name, release_date, category_id });
        res.status(201).json(newArtPiece);
    } catch (error) {
        res.status(500).json({ message: 'Error creating Art Piece', error });
    }
});
  
module.exports = router;
