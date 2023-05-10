const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Client } = require('@elastic/elasticsearch');
const { Review, Tag, Category, ArtPiece, ReviewLikes, CommentLikes, Comment, UserRating, ReviewTag, RevyUser} = require('../models/');
require('dotenv').config();

const elasticApiKey = process.env.ELASTIC_API_KEY;
const elasticCloudId = process.env.ELASTIC_CLOUD_ID;
const client = new Client({
  cloud: {
    id: elasticCloudId
  },
  auth: {
    apiKey: elasticApiKey,
  }
})

const searchArtPieces = async (query) => {
  const searchResults = await client.search({
    index: "art_pieces",
    body: {
      query: {
        multi_match: {
          query: query,
          fields: ["name"],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      },
    },
  });
  console.log("found matches in the following art pieuces:", searchResults.hits.hits);
  return searchResults.hits.hits.map((hit) => hit._id);
};

const searchCategories = async (query) => {
  const searchResults = await client.search({
    index: "categories",
    body: {
      query: {
        multi_match: {
          query: query,
          fields: ["name"],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      },
    },
  });
  console.log("found matches in the following categories:", searchResults.hits.hits);
  return searchResults.hits.hits.map((hit) => hit._id);
};

const searchComments = async (query) => {
  const searchResults = await client.search({
    index: "comments",
    body: {
      query: {
        multi_match: {
          query: query,
          fields: ["text"],
          type: "best_fields",
          fuzziness: "AUTO:0,2",
        },
      },
    },
  });
  console.log("found matches in the following comments:", searchResults.hits.hits);
  return searchResults.hits.hits.map((hit) => hit._source.review_id);
};

const searchReviews = async (query) => {
  const searchResults = await client.search({
    index: "reviews",
    body: {
      query: {
        multi_match: {
          query: query,
          fields: ["review_name", "review_text"],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      },
    },
  });
  console.log("found matches in the following reviews:", searchResults.hits.hits);
  return searchResults.hits.hits.map((hit) => hit._id);
};

const searchTags = async (query) => {
  const searchResults = await client.search({
    index: "tags",
    body: {
      query: {
        multi_match: {
          query: query,
          fields: ["name"],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      },
    },
  });
  const tagIds = searchResults.hits.hits.map((hit) => hit._id);
  const reviewTags = await ReviewTag.findAll({ where: { tag_id: tagIds } });
  const reviewIds = reviewTags.map((reviewTag) => reviewTag.review_id);

  console.log("found matches in the following tagged reviews:", reviewIds);
  return [...new Set(reviewIds)];
};

const searchUsers = async (query) => {
  const searchResults = await client.search({
    index: "revy_users",
    body: {
      query: {
        multi_match: {
          query: query,
          fields: ["username"],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      },
    },
  });
  console.log("found matches in the following users:", searchResults.hits.hits);
  const userIds = searchResults.hits.hits.map((hit) => hit._id);

  const userReviews = await Review.findAll({ where: { user_id: userIds } });
  const userReviewIds = userReviews.map(review => review.id);

  return [...new Set(userReviewIds)];
};


const searchReviewsByQuery  = async (req, res) => {
  try {
    const { query } = req.query;
    console.log("received a search:", query);
    
    const artPieceIds = await searchArtPieces(query);
    const categoryIds = await searchCategories(query);
    const commentReviewIds = await searchComments(query);
    const reviewIds = await searchReviews(query);
    const tagReviewIds = await searchTags(query);
    const userIds = await searchUsers(query);

    const allReviewIds = [
      ...new Set([
        ...commentReviewIds,
        ...reviewIds,
        ...tagReviewIds,
        ...artPieceIds,
        ...categoryIds,
        ...userIds,
      ]),
    ];
    console.log("found matches in the following reviews:", allReviewIds);

    const reviews = await Review.findAll({
      where: { id: allReviewIds },
      order: [['created_at', 'DESC']],
      include: [
        { association: 'author' },
        {
          association: 'art_piece',
          include: {
            model: Category,
            as: 'category',
            attributes: ['name'],
          },
        },
        {
          model: Tag,
          association: 'tags',
          through: {
            attributes: [],
          },
        },
        {
          association: 'comments',
          include: [
            { association: 'author' },
            { association: 'liked_by_users', attributes: ['id', 'username'] }, 
          ],
        },
        { association: 'liked_by_users' },
        { association: 'ratings' },
      ],
    });


    console.log(reviews);
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while searching for reviews' });
  }
};

router.get('/search', searchReviewsByQuery);

module.exports = router;
