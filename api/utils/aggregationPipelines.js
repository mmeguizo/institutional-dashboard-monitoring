/**
 * Shared Aggregation Pipeline Utilities
 * Optimized pipeline stages for common operations
 * These pipelines use indexed fields for better performance
 */

/**
 * Optimized user lookup stage
 * Uses indexed 'id' field for efficient matching
 */
const userLookupOptimized = {
  $lookup: {
    from: "users",
    localField: "createdBy",
    foreignField: "id",
    as: "users",
    pipeline: [
      {
        $project: {
          id: 1,
          username: 1,
          firstname: 1,
          lastname: 1,
          role: 1,
          email: 1,
          profile_pic: 1,
          department: 1,
        },
      },
    ],
  },
};

/**
 * Optimized objectives lookup stage
 * Uses indexed 'id' and 'deleted' fields
 */
const objectivesLookupOptimized = {
  $lookup: {
    from: "objectives",
    let: { objectiveIds: { $ifNull: ["$objectives", []] } },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $in: ["$id", { $ifNull: ["$$objectiveIds", []] }] },
              { $eq: ["$deleted", false] },
            ],
          },
        },
      },
      // Only select essential fields to reduce memory usage
      {
        $project: {
          id: 1,
          functional_objective: 1,
          performance_indicator: 1,
          target: 1,
          formula: 1,
          programs: 1,
          responsible_persons: 1,
          clients: 1,
          remarks: 1,
          frequency_monitoring: 1,
          timetable: 1,
          complete: 1,
          data_source: 1,
          budget: 1,
          date_added: 1,
          createdBy: 1,
          updateby: 1,
          updateDate: 1,
          createdAt: 1,
          deleted: 1,
          // Monthly fields
          month_0: 1, month_1: 1, month_2: 1, month_3: 1,
          month_4: 1, month_5: 1, month_6: 1, month_7: 1,
          month_8: 1, month_9: 1, month_10: 1, month_11: 1,
          // File monthly fields
          file_month_0: 1, file_month_1: 1, file_month_2: 1, file_month_3: 1,
          file_month_4: 1, file_month_5: 1, file_month_6: 1, file_month_7: 1,
          file_month_8: 1, file_month_9: 1, file_month_10: 1, file_month_11: 1,
          // Goal monthly fields
          goal_month_0: 1, goal_month_1: 1, goal_month_2: 1, goal_month_3: 1,
          goal_month_4: 1, goal_month_5: 1, goal_month_6: 1, goal_month_7: 1,
          goal_month_8: 1, goal_month_9: 1, goal_month_10: 1, goal_month_11: 1,
          // Quarterly fields
          quarter_0: 1, quarter_1: 1, quarter_2: 1, quarter_3: 1,
          file_quarter_0: 1, file_quarter_1: 1, file_quarter_2: 1, file_quarter_3: 1,
          goal_quarter_0: 1, goal_quarter_1: 1, goal_quarter_2: 1, goal_quarter_3: 1,
          // Semi-annual fields
          semi_annual_0: 1, semi_annual_1: 1, semi_annual_2: 1,
          file_semi_annual_0: 1, file_semi_annual_1: 1, file_semi_annual_2: 1,
          goal_semi_annual_0: 1, goal_semi_annual_1: 1, goal_semi_annual_2: 1,
        },
      },
    ],
    as: "objectivesDetails",
  },
};

/**
 * Optimized objectives lookup for summary views (minimal fields)
 */
const objectivesLookupSummary = {
  $lookup: {
    from: "objectives",
    let: { objectiveIds: { $ifNull: ["$objectives", []] } },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $in: ["$id", { $ifNull: ["$$objectiveIds", []] }] },
              { $eq: ["$deleted", false] },
            ],
          },
        },
      },
      {
        $project: {
          id: 1,
          functional_objective: 1,
          target: 1,
          budget: 1,
          complete: 1,
        },
      },
    ],
    as: "objectivesDetails",
  },
};

/**
 * Goals base match stage for active goals
 */
const activeGoalsMatch = {
  $match: {
    deleted: false,
  },
};

/**
 * Standard unwind for user lookup
 */
const userUnwind = {
  $unwind: { path: "$users", preserveNullAndEmptyArrays: true },
};

/**
 * Add fields to handle empty objectives array
 */
const handleEmptyObjectives = {
  $addFields: {
    objectivesDetails: {
      $cond: {
        if: { $eq: ["$objectivesDetails", []] },
        then: null,
        else: "$objectivesDetails",
      },
    },
  },
};

/**
 * Base goals projection (reduced fields for better performance)
 */
const goalsBaseProjection = {
  $project: {
    _id: 1,
    id: 1,
    goals: 1,
    budget: 1,
    department: 1,
    campus: 1,
    createdBy: 1,
    deleted: 1,
    date_added: 1,
    createdAt: 1,
    goallistsId: 1,
    updatedAt: 1,
    complete: 1,
    "users.id": 1,
    "users.username": 1,
    "users.firstname": 1,
    "users.lastname": 1,
    "users.role": 1,
    "users.department": 1,
    "users.profile_pic": 1,
    objectivesDetails: 1,
  },
};

/**
 * Build optimized goals with objectives pipeline
 * @param {Object} matchCondition - Additional match conditions
 * @returns {Array} Aggregation pipeline
 */
function buildGoalsWithObjectivesPipeline(matchCondition = {}) {
  const baseMatch = { deleted: false, ...matchCondition };
  
  return [
    { $match: baseMatch },
    objectivesLookupOptimized,
    userLookupOptimized,
    userUnwind,
    handleEmptyObjectives,
    goalsBaseProjection,
    { $sort: { _id: -1 } },
  ];
}

/**
 * Build optimized goals summary pipeline (for dashboards)
 * @param {Object} matchCondition - Additional match conditions
 * @returns {Array} Aggregation pipeline
 */
function buildGoalsSummaryPipeline(matchCondition = {}) {
  const baseMatch = { deleted: false, ...matchCondition };
  
  return [
    { $match: baseMatch },
    objectivesLookupSummary,
    {
      $project: {
        id: 1,
        goals: 1,
        budget: 1,
        department: 1,
        complete: 1,
        objectivesCount: { $size: { $ifNull: ["$objectivesDetails", []] } },
        completedObjectivesCount: {
          $size: {
            $filter: {
              input: { $ifNull: ["$objectivesDetails", []] },
              as: "obj",
              cond: { $eq: ["$$obj.complete", true] },
            },
          },
        },
      },
    },
  ];
}

/**
 * Build user IDs lookup for director/VP queries
 * @param {string} role - Role type ('director' or 'vice-president')
 * @param {string} userId - User ID
 * @returns {Object} Match condition for goals
 */
async function getUserIdsForRole(role, userId, Users) {
  let userIds = [userId]; // Always include the current user
  
  if (role === "director") {
    const usersUnder = await Users.find({ director_id: userId })
      .select({ id: 1 })
      .lean();
    userIds = [...userIds, ...usersUnder.map(u => u.id)];
  } else if (role === "vice-president") {
    const usersUnder = await Users.find({ vice_president_id: userId })
      .select({ id: 1 })
      .lean();
    userIds = [...userIds, ...usersUnder.map(u => u.id)];
  }
  
  return userIds;
}

module.exports = {
  userLookupOptimized,
  objectivesLookupOptimized,
  objectivesLookupSummary,
  activeGoalsMatch,
  userUnwind,
  handleEmptyObjectives,
  goalsBaseProjection,
  buildGoalsWithObjectivesPipeline,
  buildGoalsSummaryPipeline,
  getUserIdsForRole,
};
