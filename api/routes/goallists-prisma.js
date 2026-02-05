/**
 * Goallists Routes - Prisma/MySQL Version
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");

module.exports = (router) => {
  // Add goal with objectives
  router.post("/addGoal", async (req, res) => {
    try {
      const { goals, objectives, createdBy } = req.body;

      // Create the goallist
      const goallist = await prisma.goallist.create({
        data: {
          visibleId: uuidv4(),
          goals,
          createdBy: createdBy || '',
        },
      });

      // Create objectives linked to this goallist
      if (objectives && objectives.length > 0) {
        const objectiveData = objectives.map((obj) => ({
          visibleId: uuidv4(),
          goallistId: goallist.id,
          objective: obj.objective || '',
          createdBy: obj.createdBy || '',
        }));

        await prisma.goallistObjective.createMany({
          data: objectiveData,
        });
      }

      // Fetch the created goallist with its objectives
      const result = await prisma.goallist.findUnique({
        where: { id: goallist.id },
        include: { goallistObjectives: true },
      });

      res.status(200).json({
        success: true,
        message: "Goal Added",
        data: {
          id: result.visibleId,
          goals: result.goals,
          createdBy: result.createdBy,
          objectives: result.goallistObjectives.map((o) => ({
            id: o.visibleId,
            objective: o.objective,
            createdBy: o.createdBy,
          })),
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get all goal lists
  router.get("/getAllGoalLists", async (req, res) => {
    try {
      const goallists = await prisma.goallist.findMany({
        where: { deleted: false },
        include: { goallistObjectives: true },
        orderBy: { createdAt: "desc" },
      });

      const data = goallists.map((g) => ({
        id: g.visibleId,
        _id: g.id,
        goals: g.goals,
        createdBy: g.createdBy,
        deleted: g.deleted,
        objectives: g.goallistObjectives.map((o) => ({
          id: o.visibleId,
          _id: o.id,
          objective: o.objective,
          createdBy: o.createdBy,
        })),
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      }));

      res.status(200).json({ success: true, data: [data] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Soft delete goal list
  router.put("/deleteGoalLists", async (req, res) => {
    try {
      const { id } = req.body;

      const deletedGoal = await prisma.goallist.update({
        where: { visibleId: id },
        data: { deleted: true },
      });

      if (!deletedGoal) {
        return res.status(404).json({
          success: false,
          message: "Goal not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Goal deleted successfully",
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: "Goal not found",
        });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Update goal list
  router.put("/updateGoalList", async (req, res) => {
    try {
      const { id, goals, objectives } = req.body;

      if (!id || !goals) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: id or goals",
        });
      }

      // First, get the goallist
      const existingGoallist = await prisma.goallist.findFirst({
        where: { visibleId: id },
        include: { goallistObjectives: true },
      });

      if (!existingGoallist) {
        return res.status(404).json({
          success: false,
          message: "Goal list not found",
        });
      }

      // Update the goallist
      await prisma.goallist.update({
        where: { id: existingGoallist.id },
        data: { goals },
      });

      // Handle objectives update
      if (objectives && Array.isArray(objectives)) {
        // Delete existing objectives
        await prisma.goallistObjective.deleteMany({
          where: { goallistId: existingGoallist.id },
        });

        // Create new objectives
        const objectiveData = objectives.map((obj) => ({
          visibleId: obj.id || uuidv4(),
          goallistId: existingGoallist.id,
          objective: obj.objective || '',
          createdBy: obj.createdBy || '',
        }));

        await prisma.goallistObjective.createMany({
          data: objectiveData,
        });
      }

      // Fetch updated goallist
      const updatedGoal = await prisma.goallist.findUnique({
        where: { id: existingGoallist.id },
        include: { goallistObjectives: true },
      });

      res.status(200).json({
        success: true,
        message: "Goal updated successfully",
        data: {
          id: updatedGoal.visibleId,
          goals: updatedGoal.goals,
          objectives: updatedGoal.goallistObjectives.map((o) => ({
            id: o.visibleId,
            objective: o.objective,
            createdBy: o.createdBy,
          })),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Get all goallists for dropdown
  router.get("/getAllGoallistsDropdown", async (req, res) => {
    try {
      const goallists = await prisma.goallist.findMany({
        where: { deleted: false },
        include: { goallistObjectives: true },
      });

      const data = goallists.map((g) => ({
        name: g.goals,
        code: g.goals,
        id: g.visibleId,
        _id: g.id,
        objectives: g.goallistObjectives.map((obj) => ({
          goal_id: g.visibleId,
          name: obj.objective,
          code: obj.objective,
          id: obj.visibleId,
          _id: obj.id,
        })),
      }));

      res.json({ success: true, data: [data] });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get objectives for adding to a specific goallist
  router.get("/getAllAddObjectivesGoallistsDropdown/:id", async (req, res) => {
    try {
      const goallist = await prisma.goallist.findFirst({
        where: {
          visibleId: req.params.id,
          deleted: false,
        },
        include: { goallistObjectives: true },
      });

      if (!goallist) {
        return res.json({ success: false, message: "Goallist not found" });
      }

      const objectives = goallist.goallistObjectives.map((obj) => ({
        name: obj.objective,
        code: obj.objective,
        GoalId: goallist.visibleId,
        goal: goallist.goals,
        objId: obj.visibleId,
      }));

      res.json({ success: true, objectives });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get objectives for editing a specific goallist
  router.get("/getAllEditObjectivesGoallistsDropdown/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const goallist = await prisma.goallist.findFirst({
        where: {
          visibleId: id,
          deleted: false,
        },
        include: { goallistObjectives: true },
      });

      if (!goallist) {
        return res.json({ success: false, message: "Goallist not found" });
      }

      const objectives = goallist.goallistObjectives.map((obj) => ({
        name: obj.objective,
        code: obj.objective,
        GoalId: goallist.visibleId,
        goal: goallist.goals,
        objId: obj.visibleId,
      }));

      res.json({
        success: true,
        goallist: {
          id: goallist.visibleId,
          goals: goallist.goals,
        },
        objectives,
      });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  return router;
};
