const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { Tag, Review, ReviewTag } = require('../models/');

const getTags = async (req, res) => {
  try {
    console.log("received a tag request");
    const tags = await Tag.findAll({
      attributes: ['id', 'name', [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'usageCount']],
      include: [
        {
          model: Review,
          as: 'reviews',  // use the alias here
          attributes: [],
          through: { attributes: [] },
        },
      ],
      group: ['Tag.id', 'name'],
      order: [['name', 'ASC']],
    });
    console.log("tags", tags);
    res.status(200).json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Error fetching tags', error: error.message });
  }
};


router.get('/', getTags);

module.exports = router;
