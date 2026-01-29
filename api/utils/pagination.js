/**
 * Pagination Utility Helper
 * Provides standardized pagination for MongoDB queries
 */

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Express request query object
 * @param {Object} options - Default options
 * @returns {Object} Pagination parameters
 */
function parsePaginationParams(query, options = {}) {
  const defaults = {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  };
  
  const config = { ...defaults, ...options };
  
  let page = parseInt(query.page) || config.defaultPage;
  let limit = parseInt(query.limit) || config.defaultLimit;
  
  // Ensure page is at least 1
  page = Math.max(1, page);
  
  // Ensure limit is within bounds
  limit = Math.min(Math.max(1, limit), config.maxLimit);
  
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Create pagination metadata for response
 * @param {number} totalCount - Total number of documents
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
function createPaginationMeta(totalCount, page, limit) {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    currentPage: page,
    totalPages,
    totalCount,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
}

/**
 * Add pagination stages to MongoDB aggregation pipeline
 * @param {Array} pipeline - Existing aggregation pipeline
 * @param {number} skip - Number of documents to skip
 * @param {number} limit - Number of documents to return
 * @returns {Array} Pipeline with pagination stages
 */
function addPaginationToAggregation(pipeline, skip, limit) {
  return [
    ...pipeline,
    { $skip: skip },
    { $limit: limit },
  ];
}

/**
 * Create a count pipeline from an existing aggregation pipeline
 * @param {Array} pipeline - Existing aggregation pipeline (without $skip/$limit)
 * @returns {Array} Pipeline that returns count
 */
function createCountPipeline(pipeline) {
  // Remove any existing $skip, $limit, $sort stages for counting
  const countPipeline = pipeline.filter(
    (stage) => !stage.$skip && !stage.$limit
  );
  
  return [
    ...countPipeline,
    { $count: "total" },
  ];
}

/**
 * Execute paginated aggregation query
 * @param {Object} Model - Mongoose model
 * @param {Array} pipeline - Aggregation pipeline (without $skip/$limit)
 * @param {Object} paginationParams - { page, limit, skip }
 * @param {Object} options - Additional options like allowDiskUse
 * @returns {Promise<Object>} { data, pagination }
 */
async function executePaginatedAggregation(Model, pipeline, paginationParams, options = {}) {
  const { page, limit, skip } = paginationParams;
  const { allowDiskUse = true } = options;
  
  // Execute count and data queries in parallel for performance
  const [countResult, data] = await Promise.all([
    Model.aggregate(createCountPipeline(pipeline), { allowDiskUse }),
    Model.aggregate(addPaginationToAggregation(pipeline, skip, limit), { allowDiskUse }),
  ]);
  
  const totalCount = countResult[0]?.total || 0;
  const pagination = createPaginationMeta(totalCount, page, limit);
  
  return { data, pagination };
}

/**
 * Execute paginated find query
 * @param {Object} Model - Mongoose model
 * @param {Object} filter - Query filter
 * @param {Object} projection - Fields to select
 * @param {Object} paginationParams - { page, limit, skip }
 * @param {Object} options - Additional options like sort
 * @returns {Promise<Object>} { data, pagination }
 */
async function executePaginatedFind(Model, filter, projection, paginationParams, options = {}) {
  const { page, limit, skip } = paginationParams;
  const { sort = { _id: -1 } } = options;
  
  // Execute count and data queries in parallel for performance
  const [totalCount, data] = await Promise.all([
    Model.countDocuments(filter),
    Model.find(filter, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(), // Use lean() for better performance when you don't need Mongoose documents
  ]);
  
  const pagination = createPaginationMeta(totalCount, page, limit);
  
  return { data, pagination };
}

module.exports = {
  parsePaginationParams,
  createPaginationMeta,
  addPaginationToAggregation,
  createCountPipeline,
  executePaginatedAggregation,
  executePaginatedFind,
};
