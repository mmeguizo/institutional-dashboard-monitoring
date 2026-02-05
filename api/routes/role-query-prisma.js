/**
 * Role-based Query Routes - Prisma/MySQL Version
 * Combines director_query, vice_president_query, office_head_query
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");

// Format ISO date helper
const formatIsoDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Calculate budget and completion for goals
async function CalculateBudgetAndCompletion(goals) {
  return goals.map((goal) => {
    let totalCompletion = 0;
    let totalObjectives = 0;

    if (goal.objectives && goal.objectives.length > 0) {
      for (const obj of goal.objectives) {
        let objectiveCompletion = 0;
        let count = 0;
        let goalSum = 0;

        if (obj.frequencyMonitoring === "yearly") {
          if (obj.yearly0 !== null && obj.yearly0 !== undefined) {
            goalSum += obj.yearly0;
            count++;
          }
        } else if (obj.frequencyMonitoring === "monthly") {
          for (let i = 0; i < 12; i++) {
            const val = obj[`month${i}`];
            if (val !== null && val !== undefined) {
              goalSum += val;
              count++;
            }
          }
        } else if (obj.frequencyMonitoring === "quarterly") {
          for (let i = 0; i < 4; i++) {
            const val = obj[`quarter${i}`];
            if (val !== null && val !== undefined) {
              goalSum += val;
              count++;
            }
          }
        } else if (obj.frequencyMonitoring === "semi_annual") {
          for (let i = 0; i < 2; i++) {
            const val = obj[`semiAnnual${i}`];
            if (val !== null && val !== undefined) {
              goalSum += val;
              count++;
            }
          }
        }

        if (count > 0 && obj.target > 0) {
          objectiveCompletion = (goalSum / obj.target) * 100;
          totalCompletion += objectiveCompletion;
          totalObjectives++;
        }
      }
    }

    const completion_percentage = totalObjectives > 0 
      ? Math.round(totalCompletion / totalObjectives) 
      : 0;

    return {
      _id: goal.id,
      id: goal.visibleId,
      goals: goal.goals,
      budget: goal.budget,
      department: goal.department,
      campus: goal.campus,
      createdBy: goal.createdBy,
      deleted: goal.deleted,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
      goallistsId: goal.goallistsId,
      searchDate: formatIsoDate(goal.createdAt),
      completion_percentage,
      complete: completion_percentage === 100,
      users: goal.creator ? {
        id: goal.creator.visibleId,
        username: goal.creator.username,
        firstname: goal.creator.firstname,
        lastname: goal.creator.lastname,
        department: goal.creator.department,
        role: goal.creator.role?.toLowerCase().replace('_', '-'),
      } : null,
      objectivesDetails: goal.objectives?.map(obj => formatObjective(obj)) || null,
    };
  });
}

// Format objective for response
const formatObjective = (obj) => ({
  id: obj.visibleId,
  functional_objective: obj.functionalObjective,
  performance_indicator: obj.performanceIndicator,
  target: obj.target,
  formula: obj.formula,
  programs: obj.programs,
  responsible_persons: obj.responsiblePersons,
  clients: obj.clients,
  remarks: obj.remarks,
  frequency_monitoring: obj.frequencyMonitoring,
  timetable: obj.timetable,
  complete: obj.complete,
  data_source: obj.dataSource,
  budget: obj.budget,
  date_added: obj.dateAdded,
  createdBy: obj.createdBy,
  createdAt: obj.createdAt,
  deleted: obj.deleted,
  month_0: obj.month0, month_1: obj.month1, month_2: obj.month2,
  month_3: obj.month3, month_4: obj.month4, month_5: obj.month5,
  month_6: obj.month6, month_7: obj.month7, month_8: obj.month8,
  month_9: obj.month9, month_10: obj.month10, month_11: obj.month11,
  goal_month_0: obj.goalMonth0, goal_month_1: obj.goalMonth1, goal_month_2: obj.goalMonth2,
  goal_month_3: obj.goalMonth3, goal_month_4: obj.goalMonth4, goal_month_5: obj.goalMonth5,
  goal_month_6: obj.goalMonth6, goal_month_7: obj.goalMonth7, goal_month_8: obj.goalMonth8,
  goal_month_9: obj.goalMonth9, goal_month_10: obj.goalMonth10, goal_month_11: obj.goalMonth11,
  quarter_0: obj.quarter0, quarter_1: obj.quarter1, quarter_2: obj.quarter2, quarter_3: obj.quarter3,
  goal_quarter_0: obj.goalQuarter0, goal_quarter_1: obj.goalQuarter1, goal_quarter_2: obj.goalQuarter2, goal_quarter_3: obj.goalQuarter3,
  semi_annual_0: obj.semiAnnual0, semi_annual_1: obj.semiAnnual1,
  goal_semi_annual_0: obj.goalSemiAnnual0, goal_semi_annual_1: obj.goalSemiAnnual1,
  yearly_0: obj.yearly0, goal_year_0: obj.goalYear0,
});

// Get user IDs under a specific leader
async function getUserIdsUnderLeader(leaderId, leaderType) {
  let whereCondition = {};
  
  if (leaderType === 'vice-president') {
    whereCondition = { vicePresidentId: leaderId };
  } else if (leaderType === 'director') {
    whereCondition = { directorId: leaderId };
  } else {
    whereCondition = { visibleId: leaderId };
  }

  const users = await prisma.user.findMany({
    where: whereCondition,
    select: { visibleId: true },
  });

  const userIds = users.map(u => u.visibleId);
  userIds.push(leaderId);
  return userIds;
}

// ====================
// DIRECTOR ROUTES
// ====================
const directorRoutes = (router) => {
  // Get goals dashboard for director
  router.get("/getGoalsForDashboardDirector/:id", async (req, res) => {
    try {
      const userIds = await getUserIdsUnderLeader(req.params.id, 'director');

      const [goalCount, goalDeletedCount, goalAmountTotal] = await Promise.all([
        prisma.goal.count({ where: { deleted: false, createdBy: { in: userIds } } }),
        prisma.goal.count({ where: { deleted: true, createdBy: { in: userIds } } }),
        prisma.goal.aggregate({
          where: { deleted: false, createdBy: { in: userIds } },
          _sum: { budget: true },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: [{
          goalCount,
          goalDeletedCount,
          totalBudget: [{ totalAmount: goalAmountTotal._sum.budget || 0 }],
        }],
      });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get objectives view table for director
  router.get("/getObjectivesViewTableDirector/:id", async (req, res) => {
    try {
      const userIds = await getUserIdsUnderLeader(req.params.id, 'director');

      const goals = await prisma.goal.findMany({
        where: { deleted: false, createdBy: { in: userIds } },
        include: {
          objectives: { where: { deleted: false } },
          creator: {
            select: {
              visibleId: true, username: true, firstname: true, lastname: true, department: true, role: true
            }
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!goals.length) {
        return res.json({ success: false, message: "No Goals found.", Goals: [] });
      }

      const processedGoals = await CalculateBudgetAndCompletion(goals);
      res.json({ success: true, goals: processedGoals });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get all objectives under a director
  router.get("/getAllObjectivesUnderADirector/:id", async (req, res) => {
    try {
      const userIds = await getUserIdsUnderLeader(req.params.id, 'director');

      const goals = await prisma.goal.findMany({
        where: { deleted: false, createdBy: { in: userIds } },
        include: {
          objectives: { where: { deleted: false } },
          creator: {
            select: {
              visibleId: true, username: true, firstname: true, lastname: true, department: true, role: true
            }
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const processedGoals = await CalculateBudgetAndCompletion(goals);
      res.json({ success: true, goals: processedGoals });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  return router;
};

// ====================
// VICE PRESIDENT ROUTES
// ====================
const vicePresidentRoutes = (router) => {
  // Get goals dashboard for vice president
  router.get("/getGoalsForDashboardVicePresident/:id", async (req, res) => {
    try {
      const userIds = await getUserIdsUnderLeader(req.params.id, 'vice-president');

      const [goalCount, goalDeletedCount, goalAmountTotal] = await Promise.all([
        prisma.goal.count({ where: { deleted: false, createdBy: { in: userIds } } }),
        prisma.goal.count({ where: { deleted: true, createdBy: { in: userIds } } }),
        prisma.goal.aggregate({
          where: { deleted: false, createdBy: { in: userIds } },
          _sum: { budget: true },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: [{
          goalCount,
          goalDeletedCount,
          totalBudget: [{ totalAmount: goalAmountTotal._sum.budget || 0 }],
        }],
      });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get objectives view table for vice president
  router.get("/getObjectivesViewTableVicePresident/:id", async (req, res) => {
    try {
      const userIds = await getUserIdsUnderLeader(req.params.id, 'vice-president');

      const goals = await prisma.goal.findMany({
        where: { deleted: false, createdBy: { in: userIds } },
        include: {
          objectives: { where: { deleted: false } },
          creator: {
            select: {
              visibleId: true, username: true, firstname: true, lastname: true, department: true, role: true
            }
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!goals.length) {
        return res.json({ success: false, message: "No Goals found.", Goals: [] });
      }

      const processedGoals = await CalculateBudgetAndCompletion(goals);
      res.json({ success: true, goals: processedGoals });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get all objectives under a vice president
  router.get("/getAllObjectivesUnderAVicePresident/:id", async (req, res) => {
    try {
      const userIds = await getUserIdsUnderLeader(req.params.id, 'vice-president');

      const goals = await prisma.goal.findMany({
        where: { deleted: false, createdBy: { in: userIds } },
        include: {
          objectives: { where: { deleted: false } },
          creator: {
            select: {
              visibleId: true, username: true, firstname: true, lastname: true, department: true, role: true
            }
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const processedGoals = await CalculateBudgetAndCompletion(goals);
      res.json({ success: true, goals: processedGoals });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  return router;
};

// ====================
// OFFICE HEAD ROUTES
// ====================
const officeHeadRoutes = (router) => {
  // Get goals dashboard for office head
  router.get("/getGoalsForDashboardOfficeHead/:id", async (req, res) => {
    try {
      const userIds = [req.params.id]; // Office head only sees their own goals

      const [goalCount, goalDeletedCount, goalAmountTotal] = await Promise.all([
        prisma.goal.count({ where: { deleted: false, createdBy: { in: userIds } } }),
        prisma.goal.count({ where: { deleted: true, createdBy: { in: userIds } } }),
        prisma.goal.aggregate({
          where: { deleted: false, createdBy: { in: userIds } },
          _sum: { budget: true },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: [{
          goalCount,
          goalDeletedCount,
          totalBudget: [{ totalAmount: goalAmountTotal._sum.budget || 0 }],
        }],
      });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get objectives view table for office head
  router.get("/getObjectivesViewTableOfficeHead/:id", async (req, res) => {
    try {
      const userIds = [req.params.id];

      const goals = await prisma.goal.findMany({
        where: { deleted: false, createdBy: { in: userIds } },
        include: {
          objectives: { where: { deleted: false } },
          creator: {
            select: {
              visibleId: true, username: true, firstname: true, lastname: true, department: true, role: true
            }
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!goals.length) {
        return res.json({ success: false, message: "No Goals found.", Goals: [] });
      }

      const processedGoals = await CalculateBudgetAndCompletion(goals);
      res.json({ success: true, goals: processedGoals });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get all objectives under an office head
  router.get("/getAllObjectivesUnderAOfficeHead/:id", async (req, res) => {
    try {
      const userIds = [req.params.id];

      const goals = await prisma.goal.findMany({
        where: { deleted: false, createdBy: { in: userIds } },
        include: {
          objectives: { where: { deleted: false } },
          creator: {
            select: {
              visibleId: true, username: true, firstname: true, lastname: true, department: true, role: true
            }
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const processedGoals = await CalculateBudgetAndCompletion(goals);
      res.json({ success: true, goals: processedGoals });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  return router;
};

// ====================
// SHARED FILE ROUTES (used by all roles)
// ====================
const sharedFileRoutes = (router) => {
  // Get all files from objective
  router.get("/getAllFilesFromObjective/:user_id/:objective_id", async (req, res) => {
    try {
      const files = await prisma.fileUpload.findMany({
        where: {
          objectiveId: req.params.objective_id,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedFiles = files.map(f => ({
        _id: f.id,
        id: f.visibleId,
        user_id: f.userId,
        objective_id: f.objectiveId,
        source: f.source,
        for: f.for,
        filetype: f.filetype,
        status: f.status,
        createdAt: f.createdAt,
      }));

      res.json({ success: true, files: formattedFiles });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get all files history from objective
  router.get("/getAllFilesHistoryFromObjectiveLoad/:user_id/:objective_id", async (req, res) => {
    try {
      const files = await prisma.fileUpload.findMany({
        where: {
          objectiveId: req.params.objective_id,
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedFiles = files.map(f => ({
        _id: f.id,
        id: f.visibleId,
        user_id: f.userId,
        objective_id: f.objectiveId,
        source: f.source,
        for: f.for,
        filetype: f.filetype,
        status: f.status,
        createdAt: f.createdAt,
      }));

      res.json({ success: true, files: formattedFiles });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  return router;
};

module.exports = {
  directorRoutes,
  vicePresidentRoutes,
  officeHeadRoutes,
  sharedFileRoutes,
};
