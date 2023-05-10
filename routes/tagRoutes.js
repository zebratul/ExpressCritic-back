const express = require('express');
const router = express.Router();
const { Tag } = require('../models/');

const getTags = async (req, res) => {
    try {
      const tags = await Tag.findAll({ attributes: ['id', 'name'] });
      res.status(200).json(tags);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching tags', error });
    }
  };
  
  router.get('/', getTags);

  module.exports = router;
