/**
 * Goals Routes - Prisma/MySQL Version
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");

// Helper function for pagination
const parsePaginationParams = (query, options = {}) => {
  const { defaultLimit = 20 } = options;
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || defaultLimit;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const createPaginationMeta = (totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    currentPage: page,
    totalPages,
    totalCount,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

// Format ISO date helper
const formatIsoDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Calculate Budget and Completion for goals with objectives
async function CalculateBudgetAndCompletion(goals) {
  return Promise.all(
    goals.map(async (goal) => {
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
        ...goal,
        id: goal.visibleId,
        searchDate: formatIsoDate(goal.createdAt),
        completion_percentage,
        complete: completion_percentage === 100,
        objectivesDetails: goal.objectives?.map(obj => formatObjective(obj)) || null,
      };
    })
  );
}

// Format objective for response (map Prisma fields to expected frontend fields)
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
  updateby: obj.updateBy,
  updateDate: obj.updateDate,
  createdAt: obj.createdAt,
  deleted: obj.deleted,
  strategic_objective: obj.strategicObjective,
  // Monthly fields
  month_0: obj.month0, month_1: obj.month1, month_2: obj.month2,
  month_3: obj.month3, month_4: obj.month4, month_5: obj.month5,
  month_6: obj.month6, month_7: obj.month7, month_8: obj.month8,
  month_9: obj.month9, month_10: obj.month10, month_11: obj.month11,
  // File monthly
  file_month_0: obj.fileMonth0, file_month_1: obj.fileMonth1, file_month_2: obj.fileMonth2,
  file_month_3: obj.fileMonth3, file_month_4: obj.fileMonth4, file_month_5: obj.fileMonth5,
  file_month_6: obj.fileMonth6, file_month_7: obj.fileMonth7, file_month_8: obj.fileMonth8,
  file_month_9: obj.fileMonth9, file_month_10: obj.fileMonth10, file_month_11: obj.fileMonth11,
  // Goal monthly
  goal_month_0: obj.goalMonth0, goal_month_1: obj.goalMonth1, goal_month_2: obj.goalMonth2,
  goal_month_3: obj.goalMonth3, goal_month_4: obj.goalMonth4, goal_month_5: obj.goalMonth5,
  goal_month_6: obj.goalMonth6, goal_month_7: obj.goalMonth7, goal_month_8: obj.goalMonth8,
  goal_month_9: obj.goalMonth9, goal_month_10: obj.goalMonth10, goal_month_11: obj.goalMonth11,
  // Quarterly
  quarter_0: obj.quarter0, quarter_1: obj.quarter1, quarter_2: obj.quarter2, quarter_3: obj.quarter3,
  file_quarter_0: obj.fileQuarter0, file_quarter_1: obj.fileQuarter1, file_quarter_2: obj.fileQuarter2, file_quarter_3: obj.fileQuarter3,
  goal_quarter_0: obj.goalQuarter0, goal_quarter_1: obj.goalQuarter1, goal_quarter_2: obj.goalQuarter2, goal_quarter_3: obj.goalQuarter3,
  // Semi-annual
  semi_annual_0: obj.semiAnnual0, semi_annual_1: obj.semiAnnual1, semi_annual_2: obj.semiAnnual2,
  file_semi_annual_0: obj.fileSemiAnnual0, file_semi_annual_1: obj.fileSemiAnnual1, file_semi_annual_2: obj.fileSemiAnnual2,
  goal_semi_annual_0: obj.goalSemiAnnual0, goal_semi_annual_1: obj.goalSemiAnnual1, goal_semi_annual_2: obj.goalSemiAnnual2,
  // Yearly
  yearly_0: obj.yearly0, file_year_0: obj.fileYear0, goal_year_0: obj.goalYear0,
});

// Format goal for response
const formatGoal = (goal) => ({
  id: goal.visibleId,
  _id: goal.id,
  goals: goal.goals,
  budget: goal.budget,
  department: goal.department,
  campus: goal.campus,
  createdBy: goal.createdBy,
  deleted: goal.deleted,
  date_added: goal.dateAdded,
  createdAt: goal.createdAt,
  updatedAt: goal.updatedAt,
  goallistsId: goal.goallistsId,
  complete: goal.complete,
  strategic_objective: goal.strategicObjective,
  strategic_id: goal.strategicId,
});

// Get bar charts data helper
async function getBarChartsData(goals) {
  const officeMap = new Map();
  
  for (const goal of goals) {
    const dept = goal.department || 'Unknown';
    if (!officeMap.has(dept)) {
      officeMap.set(dept, { name: dept, count: 0, complete: 0 });
    }
    const entry = officeMap.get(dept);
    entry.count++;
    if (goal.complete) entry.complete++;
  }
  
  return Array.from(officeMap.values());
}

module.exports = (router) => {
  // Get objectives view table with pagination
  router.get("/getObjectivesViewTable", async (req, res) => {
    try {
      const { page, limit, skip } = parsePaginationParams(req.query);

      const [goals, totalCount] = await Promise.all([
        prisma.goal.findMany({
          where: { deleted: false },
          include: {
            objectives: {
              where: { deleted: false },
            },
            creator: {
              select: {
                visibleId: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.goal.count({ where: { deleted: false } }),
      ]);

      if (!goals || goals.length === 0) {
        return res.json({
          success: false,
          message: "No Goals found.",
          goals: [],
          pagination: createPaginationMeta(0, page, limit),
        });
      }

      const formattedGoals = goals.map((g) => ({
        ...g,
        users: g.creator ? {
          id: g.creator.visibleId,
          username: g.creator.username,
        } : null,
        objectives: g.objectives,
      }));

      const returnedData = await CalculateBudgetAndCompletion(formattedGoals);

      res.json({
        success: true,
        goals: returnedData,
        pagination: createPaginationMeta(totalCount, page, limit),
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get goal for creating objective
  router.get("/getGoalForCreatingObjective/:goal_id", async (req, res) => {
    try {
      const goal = await prisma.goal.findFirst({
        where: {
          visibleId: req.params.goal_id,
          deleted: false,
        },
        select: {
          id: true,
          visibleId: true,
          goals: true,
          strategicObjective: true,
          strategicId: true,
        },
      });

      if (!goal) {
        return res.json({ success: false, message: "Goal not found" });
      }

      res.status(200).json({
        success: true,
        message: "Goal found",
        goal: {
          _id: goal.id,
          id: goal.visibleId,
          goals: goal.goals,
          strategic_objective: goal.strategicObjective,
          strategic_id: goal.strategicId,
        },
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get goals for dashboard
  router.get("/getGoalsForDashboard", async (req, res) => {
    try {
      const [goalCount, goalDeletedCount, goalAmountTotal] = await Promise.all([
        prisma.goal.count({ where: { deleted: false } }),
        prisma.goal.count({ where: { deleted: true } }),
        prisma.goal.aggregate({
          where: { deleted: false },
          _sum: { budget: true },
        }),
      ]);

      res.json({
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

  // Get all objectives with objectives (with bar chart data)
  router.get("/getAllObjectivesWithObjectives", async (req, res) => {
    try {
      const goals = await prisma.goal.findMany({
        where: { deleted: false },
        include: {
          objectives: {
            where: { deleted: false },
          },
          creator: {
            select: {
              visibleId: true,
              username: true,
              firstname: true,
              lastname: true,
              role: true,
              email: true,
              profilePic: true,
              department: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!goals || goals.length === 0) {
        return res.json({
          success: false,
          message: "No Goals found.",
          Goals: [],
        });
      }

      const formattedGoals = goals.map((g) => ({
        ...g,
        users: g.creator ? {
          id: g.creator.visibleId,
          username: g.creator.username,
          firstname: g.creator.firstname,
          lastname: g.creator.lastname,
          role: g.creator.role?.toLowerCase().replace('_', '-'),
          email: g.creator.email,
          profile_pic: g.creator.profilePic,
          department: g.creator.department,
        } : null,
        objectives: g.objectives,
      }));

      const processedGoals = await CalculateBudgetAndCompletion(formattedGoals);
      const officeDropdown = await getBarChartsData(processedGoals);

      res.json({
        success: true,
        goals: processedGoals,
        office_dropdown: officeDropdown,
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get all objectives with objectives for charts
  router.get("/getAllObjectivesWithObjectivesForCharts", async (req, res) => {
    try {
      const goals = await prisma.goal.findMany({
        where: { deleted: false },
        include: {
          objectives: {
            where: { deleted: false },
          },
          creator: {
            select: {
              visibleId: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!goals || goals.length === 0) {
        return res.json({
          success: false,
          message: "No Goals found.",
          Goals: [],
        });
      }

      const formattedGoals = goals.map((g) => ({
        ...g,
        users: g.creator ? {
          id: g.creator.visibleId,
          username: g.creator.username,
        } : null,
        objectives: g.objectives,
      }));

      const processedGoals = await CalculateBudgetAndCompletion(formattedGoals);
      const officeDropdown = await getBarChartsData(processedGoals);

      res.json({
        success: true,
        goals: processedGoals,
        office_dropdown: officeDropdown,
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get goals by user ID
  router.get("/getAllObjectivesWithObjectives/:id", async (req, res) => {
    try {
      const goals = await prisma.goal.findMany({
        where: {
          deleted: false,
          createdBy: req.params.id,
        },
        include: {
          objectives: {
            where: { deleted: false },
          },
          creator: {
            select: {
              visibleId: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!goals || goals.length === 0) {
        return res.json({
          success: false,
          message: "No Goals found.",
          Goals: [],
        });
      }

      const formattedGoals = goals.map((g) => ({
        ...g,
        users: g.creator ? {
          id: g.creator.visibleId,
          username: g.creator.username,
        } : null,
        objectives: g.objectives,
      }));

      const processedGoals = await CalculateBudgetAndCompletion(formattedGoals);

      res.json({
        success: true,
        goals: processedGoals,
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get goals by goallist ID
  router.get("/getAllObjectivesWithObjectivesByGoallistsId/:id", async (req, res) => {
    try {
      const goals = await prisma.goal.findMany({
        where: {
          deleted: false,
          goallistsId: req.params.id,
        },
        include: {
          objectives: {
            where: { deleted: false },
          },
          creator: {
            select: {
              visibleId: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!goals || goals.length === 0) {
        return res.json({
          success: false,
          message: "No Goals found.",
          Goals: [],
        });
      }

      const formattedGoals = goals.map((g) => ({
        ...g,
        users: g.creator ? {
          id: g.creator.visibleId,
          username: g.creator.username,
        } : null,
        objectives: g.objectives,
      }));

      const processedGoals = await CalculateBudgetAndCompletion(formattedGoals);

      res.json({
        success: true,
        goals: processedGoals,
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Add new goal
  router.post("/addGoal", async (req, res) => {
    try {
      const {
        goals,
        budget,
        department,
        campus,
        createdBy,
        goallistsId,
        strategic_objective,
        strategic_id,
      } = req.body;

      if (!goals) {
        return res.json({ success: false, message: "Goals field is required" });
      }

      // Build data object without using department directly as a field
      // since it's a foreign key for the departmentRef relation
      const goalData = {
        visibleId: uuidv4(),
        goals,
        budget: parseFloat(budget) || 0,
        campus: campus || 'Talisay',
        strategicObjective: strategic_objective || '',
        strategicId: strategic_id || '',
        dateAdded: new Date(),
      };

      // Handle optional relations
      if (createdBy) {
        goalData.createdBy = createdBy;
      }
      if (goallistsId) {
        goalData.goallistsId = goallistsId;
      }

      // Connect to department if provided (using the relation)
      if (department) {
        goalData.departmentRef = {
          connect: { department: department }
        };
      }

      const goal = await prisma.goal.create({
        data: goalData,
      });

      res.json({
        success: true,
        message: "Goal added successfully",
        goal: formatGoal(goal),
      });
    } catch (err) {
      // Handle case where department doesn't exist
      if (err.code === 'P2025') {
        return res.json({ success: false, message: "Referenced department does not exist" });
      }
      res.json({ success: false, message: err.message });
    }
  });

  // Update goal
  router.put("/updateGoal", async (req, res) => {
    try {
      const { id, goals, budget, department, campus, complete, strategic_objective, strategic_id } = req.body;

      if (!id) {
        return res.json({ success: false, message: "Goal ID is required" });
      }

      const updateData = {};
      if (goals !== undefined) updateData.goals = goals;
      if (budget !== undefined) updateData.budget = parseFloat(budget);
      if (campus !== undefined) updateData.campus = campus;
      if (complete !== undefined) updateData.complete = complete;
      if (strategic_objective !== undefined) updateData.strategicObjective = strategic_objective;
      if (strategic_id !== undefined) updateData.strategicId = strategic_id;

      // Handle department update through relation
      if (department !== undefined) {
        if (department) {
          updateData.departmentRef = {
            connect: { department: department }
          };
        } else {
          updateData.departmentRef = {
            disconnect: true
          };
        }
      }

      const goal = await prisma.goal.update({
        where: { visibleId: id },
        data: updateData,
      });

      res.json({
        success: true,
        message: "Goal updated successfully",
        goal: formatGoal(goal),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.json({ success: false, message: "Goal not found" });
      }
      res.json({ success: false, message: err.message });
    }
  });

  // Soft delete goal
  router.delete("/deleteGoal/:id", async (req, res) => {
    try {
      await prisma.goal.update({
        where: { visibleId: req.params.id },
        data: { deleted: true },
      });

      res.json({ success: true, message: "Goal deleted successfully" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.json({ success: false, message: "Goal not found" });
      }
      res.json({ success: false, message: err.message });
    }
  });

  // Add objective to goal
  router.put("/addObjectiveToGoal", async (req, res) => {
    try {
      const { goal_id, objective_id } = req.body;

      if (!goal_id || !objective_id) {
        return res.json({
          success: false,
          message: "Goal ID and Objective ID are required",
        });
      }

      // Find the goal
      const goal = await prisma.goal.findFirst({
        where: { visibleId: goal_id },
      });

      if (!goal) {
        return res.json({ success: false, message: "Goal not found" });
      }

      // Update the objective to link it to this goal
      await prisma.objective.update({
        where: { visibleId: objective_id },
        data: { goalId: goal.id },
      });

      res.json({
        success: true,
        message: "Objective added to goal successfully",
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get goals for dashboard by user ID
  router.get("/getGoalsForDashboard/:id", async (req, res) => {
    try {
      const [goalCount, goalDeletedCount, goalAmountTotal] = await Promise.all([
        prisma.goal.count({ where: { createdBy: req.params.id } }),
        prisma.goal.count({ where: { createdBy: req.params.id, deleted: true } }),
        prisma.goal.aggregate({
          where: { createdBy: req.params.id },
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

  // Get goals by department
  router.get("/getGoalsByDepartment/:department", async (req, res) => {
    try {
      const goals = await prisma.goal.findMany({
        where: {
          deleted: false,
          department: req.params.department,
        },
        include: {
          objectives: {
            where: { deleted: false },
          },
          creator: {
            select: {
              visibleId: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedGoals = goals.map((g) => ({
        ...g,
        users: g.creator ? {
          id: g.creator.visibleId,
          username: g.creator.username,
        } : null,
        objectives: g.objectives,
      }));

      const processedGoals = await CalculateBudgetAndCompletion(formattedGoals);

      res.json({
        success: true,
        goals: processedGoals,
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get all objectives with objectives for dashboard
  router.get("/getAllObjectivesWithObjectivesForDashboard/:campus?", async (req, res) => {
    try {
      const campusParam = req.params.campus;
      
      // Build where clause
      const whereClause = { deleted: false };
      if (campusParam && campusParam !== 'undefined') {
        whereClause.campus = campusParam;
      }

      const goals = await prisma.goal.findMany({
        where: whereClause,
        include: {
          objectives: {
            where: { deleted: false },
          },
          creator: {
            select: {
              id: true,
              visibleId: true,
              username: true,
              firstname: true,
              lastname: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedGoals = goals.map((g) => ({
        _id: g.id,
        id: g.visibleId,
        goals: g.goals,
        budget: g.budget,
        department: g.department,
        campus: g.campus,
        createdBy: g.createdBy,
        deleted: g.deleted,
        complete: g.complete,
        date_added: g.dateAdded,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
        strategic_objective: g.strategicObjective,
        strategic_id: g.strategicId,
        users: g.creator ? {
          id: g.creator.visibleId,
          _id: g.creator.id,
          username: g.creator.username,
          firstname: g.creator.firstname,
          lastname: g.creator.lastname,
        } : null,
        objectivesDetails: g.objectives?.length > 0 ? g.objectives.map(formatObjective) : null,
      }));

      const processedGoals = await CalculateBudgetAndCompletion(formattedGoals);

      res.json({
        success: true,
        goals: processedGoals,
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Find goal by ID
  router.post("/findById", async (req, res) => {
    try {
      const goal = await prisma.goal.findFirst({
        where: { visibleId: req.body.id },
        include: {
          objectives: {
            where: { deleted: false },
          },
        },
      });

      if (!goal) {
        return res.json({ success: false, message: "Goal not found" });
      }

      res.json({
        success: true,
        goal: {
          ...formatGoal(goal),
          objectivesDetails: goal.objectives?.map(formatObjective) || [],
        },
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  return router;
};
