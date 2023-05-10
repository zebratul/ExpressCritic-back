const { Client } = require('@elastic/elasticsearch');
const { ArtPiece, Category, Comment, Review, RevyUser, Tag, UserRating } = require('../models');
require('dotenv').config();

const elasticApiKey = process.env.ELASTIC_API_KEY;
const elasticCloudId = process.env.ELASTIC_CLOUD_ID;

class Indexer {
  constructor() {
    this.client = new Client({
      cloud: {
        id: elasticCloudId,
      },
      auth: {
        apiKey: elasticApiKey,
      },
    });
  }

  async indexNewData(indexName, id, data) {
    try {
      await this.client.index({
        index: indexName,
        id: id,
        body: data,
        refresh: 'true',
      });
      console.log(`New data indexed in "${indexName}" with ID "${id}".`);
    } catch (error) {
      console.error(`Error indexing new data in "${indexName}" with ID "${id}":`, error);
    }
  }
}

module.exports = Indexer;
