const express = require('express');
const router = express.Router();
const { Review, Tag, Category, ArtPiece, ReviewLikes, CommentLikes, Comment, UserRating, RevyUser } = require('../models/');
const { checkAuth } = require('../middlewares/checkAuth');
const { sequelize } = require('../models');
const Indexer = require('../utils/indexer');
const indexer = new Indexer();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit;
    console.log("received a request for pages, limit, offset:", page, limit, offset);
    const reviews = await Review.findAll({
      offset,
      limit,
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
    const totalReviews = await Review.count();
    console.log(reviews);
    res.status(200).json({ data: reviews, totalReviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching reviews' });
  }
});


router.get('/popular', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      order: [
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM "review_likes" WHERE "review_likes"."review_id" = "Review"."id")'
          ),
          'DESC',
        ],
      ],
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
    res.status(500).json({ message: 'An error occurred while fetching popular reviews' });
  }
});


router.get('/myreviews', async (req, res) => {
  try {
    const userId = req.query.userId;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit;
    console.log("received a request for user ID, pages, limit, offset:", userId, page, limit, offset);
    
    const reviews = await Review.findAll({
      where: {
        user_id: userId,
      },
      offset,
      limit,
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
    
    const totalReviews = await Review.count({
      where: {
        user_id: userId,
      },
    });

    console.log(reviews);
    res.status(200).json({ data: reviews, totalReviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching my reviews' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
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
        { association: 'tags' },
        { association: 'comments', include: { association: 'author' } },
        { association: 'liked_by_users' },
        { association: 'ratings' },
      ],
    });

    res.status(200).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching the review' });
  }
});

const createReviewController = async (req, res) => {
  try {
    const { review_name, review_text, art_piece_id, tags } = req.body;

    console.log("received a review;", review_name, review_text, art_piece_id, tags);
    const category = await Category.findOne({ where: { name: req.body.category } });

    const [artPiece, created] = await ArtPiece.findOrCreate({
      where: { name: req.body.art_piece, release_date: req.body.release_date },
      defaults: { category_id: category.id }
    })
    console.log("artpiece:", created);
    
    if (created) {
      indexer.indexNewData('art_pieces', artPiece.id, {
        name: artPiece.name,
        release_date: artPiece.release_date,
      });
    }

    const tagPromises = req.body.tags.map(async (tag) => {
      const [tagInstance, tagCreated] = await Tag.findOrCreate({ where: { name: tag } });
      return { tagInstance, tagCreated };
    });

    const tagResults = await Promise.all(tagPromises);
    const associatedTags = tagResults.map(result => result.tagInstance);
    
    tagResults.forEach(({ tagInstance, tagCreated }) => {
      if (tagCreated) {
        indexer.indexNewData('tags', tagInstance.id, {
          name: tagInstance.name,
        });
      }
    });

    const newReview = await Review.create({
      review_name: req.body.review_name,
      review_text: req.body.review_text,
      image_url: req.body.image_url,
      grade: req.body.grade,
      user_id: req.userId,
      art_piece_id: artPiece.id,
    });
    
    await newReview.setTags(associatedTags);

    indexer.indexNewData('reviews', newReview.id, {
      review_name: req.body.review_name,
      review_text: req.body.review_text,
      image_url: req.body.image_url,
    });
    
    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the review' });
  }
};
router.post('/', checkAuth, createReviewController);

const updateReviewController = async (req, res) => {
  try {
    console.log("received an edit...");
    const {
      id,
      review_name,
      review_text,
      image_url,
      grade,
      tags,
      category,
      art_piece,
      release_date,
    } = req.body;

    const categoryInstance = await Category.findOne({ where: { name: category } });

    const [artPieceInstance, artPieceCreated] = await ArtPiece.findOrCreate({
      where: { name: art_piece, release_date },
      defaults: { category_id: categoryInstance.id },
    });

    if (artPieceCreated) {
      indexer.indexNewData('art_pieces', artPieceInstance.id, {
        name: artPieceInstance.name,
        release_date: artPieceInstance.release_date,
      });
    }

    const tagPromises = tags.map(async (tag) => {
      const [tagInstance, tagCreated] = await Tag.findOrCreate({ where: { name: tag } });
      return { tagInstance, tagCreated };
    });

    const tagResults = await Promise.all(tagPromises);
    const associatedTags = tagResults.map(result => result.tagInstance);

    tagResults.forEach(({ tagInstance, tagCreated }) => {
      if (tagCreated) {
        indexer.indexNewData('tags', tagInstance.id, {
          name: tagInstance.name,
        });
      }
    });

    await Review.update(
      {
        review_name,
        review_text,
        image_url,
        grade,
        art_piece_id: artPieceInstance.id,
      },
      { where: { id } }
    );

    const updatedReview = await Review.findByPk(id);
    await updatedReview.setTags(associatedTags);

    indexer.indexNewData('reviews', updatedReview.id, {
      review_name: updatedReview.review_name,
      review_text: updatedReview.review_text,
      image_url: updatedReview.image_url,
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the review' });
  }
};
router.put('/:id', updateReviewController);

router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        {
          association: 'author',
        },
      ],
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const requestingUser = await RevyUser.findByPk(req.userId);

    if (
      requestingUser.is_admin ||
      requestingUser.username === review.author.username
    ) {
      await review.destroy();
      res.status(200).json({ message: 'Review deleted successfully' });
    } else {
      res.status(403).json({ message: 'You do not have permission to delete this review' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the review' });
  }
});


router.put('/:id/like', checkAuth, async (req, res) => {
  try {
    console.log("received a like!");
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const like = await ReviewLikes.findOne({ where: { user_id: req.userId, review_id: review.id } });

    if (like) {
      await ReviewLikes.destroy({ where: { user_id: req.userId, review_id: review.id } });
    } else {
      await ReviewLikes.create({ user_id: req.userId, review_id: review.id });
    }

    const updatedReview = await Review.findByPk(req.params.id, {
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
        { association: 'tags' },
        { association: 'comments', include: { association: 'author' } },
        { association: 'liked_by_users' },
        { association: 'ratings' },
      ],
    });

    res.json(updatedReview);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});



const createComment = async (req, res) => {
  try {
    const { reviewId, text } = req.body;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const newComment = await Comment.create({
      text,
      user_id: req.userId,
      review_id: reviewId,
    });

    const commentWithAuthorAndLikes = await Comment.findByPk(newComment.id, {
      include: [
        { association: 'author' },
        { association: 'liked_by_users', attributes: ['id', 'username'] },
      ],
    });

    indexer.indexNewData('comments', newComment.id, {
      text: newComment.text,
    });
    
    res.status(201).json(commentWithAuthorAndLikes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the comment' });
  }
};

router.post('/comments', checkAuth, createComment);

router.post('/:id/rating', checkAuth, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const existingRating = await UserRating.findOne({ where: { user_id: req.userId, review_id: review.id } });

    if (existingRating) {
      await UserRating.update({ rating: req.body.rating }, { where: { user_id: req.userId, review_id: review.id } });
    } else {
      await UserRating.create({ user_id: req.userId, review_id: review.id, rating: req.body.rating });
    }

    const updatedReview = await Review.findByPk(req.params.id, {
      include: [
        { association: 'ratings' },
        { association: 'art_piece' },
      ],
    });

    const averageRating = updatedReview.ratings.reduce((acc, curr) => acc + curr.rating, 0) / updatedReview.ratings.length;
    res.json({ ...updatedReview.toJSON(), averageRating });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

router.put('/comments/:commentId/like', checkAuth, async (req, res) => {
  try {
    console.log("Received a comment like!");
    const comment = await Comment.findByPk(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const like = await CommentLikes.findOne({ where: { user_id: req.userId, comment_id: comment.id } });

    if (like) {
      await CommentLikes.destroy({ where: { user_id: req.userId, comment_id: comment.id } });
    } else {
      await CommentLikes.create({ user_id: req.userId, comment_id: comment.id });
    }

    const updatedComment = await Comment.findByPk(req.params.commentId, {
      include: [
        { association: 'author' },
        { association: 'liked_by_users' },
      ],
    });

    res.json(updatedComment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
