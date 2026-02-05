/**
 * Objectives Routes - Prisma/MySQL Version
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");

// Format currency helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

// Format objective for response (map Prisma fields to expected frontend fields)
const formatObjective = (obj) => ({
  id: obj.visibleId,
  _id: obj.id,
  functional_objective: obj.functionalObjective,
  performance_indicator: obj.performanceIndicator,
  target: obj.target,
  formula: obj.formula,
  programs: obj.programs,
  responsible_persons: obj.responsiblePersons,
  clients: obj.clients,
  remarks: obj.remarks,
  frequency_monitoring: obj.frequencyMonitoring,
  type_of_computation: obj.typeOfComputation,
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
  status: obj.status,
  goalId: obj.goalVisibleId,
  strategic_objective: obj.strategicObjective,
  // Monthly fields
  month_0: obj.month0, month_1: obj.month1, month_2: obj.month2,
  month_3: obj.month3, month_4: obj.month4, month_5: obj.month5,
  month_6: obj.month6, month_7: obj.month7, month_8: obj.month8,
  month_9: obj.month9, month_10: obj.month10, month_11: obj.month11,
  month_0_date: obj.month0Date, month_1_date: obj.month1Date, month_2_date: obj.month2Date,
  month_3_date: obj.month3Date, month_4_date: obj.month4Date, month_5_date: obj.month5Date,
  month_6_date: obj.month6Date, month_7_date: obj.month7Date, month_8_date: obj.month8Date,
  month_9_date: obj.month9Date, month_10_date: obj.month10Date, month_11_date: obj.month11Date,
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
  quarter_0_date: obj.quarter0Date, quarter_1_date: obj.quarter1Date, quarter_2_date: obj.quarter2Date, quarter_3_date: obj.quarter3Date,
  file_quarter_0: obj.fileQuarter0, file_quarter_1: obj.fileQuarter1, file_quarter_2: obj.fileQuarter2, file_quarter_3: obj.fileQuarter3,
  goal_quarter_0: obj.goalQuarter0, goal_quarter_1: obj.goalQuarter1, goal_quarter_2: obj.goalQuarter2, goal_quarter_3: obj.goalQuarter3,
  // Semi-annual
  semi_annual_0: obj.semiAnnual0, semi_annual_1: obj.semiAnnual1, semi_annual_2: obj.semiAnnual2,
  semi_annual_0_date: obj.semiAnnual0Date, semi_annual_1_date: obj.semiAnnual1Date, semi_annual_2_date: obj.semiAnnual2Date,
  file_semi_annual_0: obj.fileSemiAnnual0, file_semi_annual_1: obj.fileSemiAnnual1, file_semi_annual_2: obj.fileSemiAnnual2,
  goal_semi_annual_0: obj.goalSemiAnnual0, goal_semi_annual_1: obj.goalSemiAnnual1, goal_semi_annual_2: obj.goalSemiAnnual2,
  // Yearly
  yearly_0: obj.yearly0, yearly_0_date: obj.yearly0Date,
  file_year_0: obj.fileYear0, goal_year_0: obj.goalYear0,
});

// Calculate percentage for objectives
async function calculatePercentage(objectives) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return objectives.map((objective) => {
    let total = 0;
    let totalCumulativeAchive = 0;
    let totalCumulativeAchiveGoal = 0;
    let totalGoalsSet = 0;
    const target = objective.target || 0;
    const updatedObjective = { ...objective };
    updatedObjective.monthPointerValue = {};

    if (objective.frequencyMonitoring === "monthly") {
      for (let i = 0; i < 12; i++) {
        total += objective[`month${i}`] || 0;
        
        if (objective.typeOfComputation === "non-cumulative" && 
            objective[`month${i}Date`] && 
            objective[`month${i}`] !== 0) {
          const monthDate = new Date(objective[`month${i}Date`]);
          const monthDateSet = monthDate.getMonth();
          updatedObjective.monthPointer = monthDateSet;
          updatedObjective.monthPointerValue[`monthPointer_${monthDateSet}`] = objective[`month${i}`] || 0;
        }

        if (objective.typeOfComputation === "cumulative") {
          if (objective[`goalMonth${i}`]) {
            totalGoalsSet += objective[`goalMonth${i}`] || 0;
          }
        }
      }
    } else if (objective.frequencyMonitoring === "quarterly") {
      for (let i = 0; i < 4; i++) {
        total += objective[`quarter${i}`] || 0;
        
        if (objective.typeOfComputation === "non-cumulative" && 
            objective[`quarter${i}Date`] && 
            objective[`quarter${i}`] !== 0) {
          const quarterDate = new Date(objective[`quarter${i}Date`]);
          const quarterDateSet = quarterDate.getMonth();
          updatedObjective.monthPointer = quarterDateSet;
          updatedObjective.monthPointerValue[`monthPointer_${quarterDateSet}`] = objective[`quarter${i}`] || 0;
        }

        if (objective.typeOfComputation === "cumulative") {
          if (objective[`goalQuarter${i}`]) {
            totalGoalsSet += objective[`goalQuarter${i}`] || 0;
          }
        }
      }
    } else if (objective.frequencyMonitoring === "semi_annual") {
      for (let i = 0; i < 2; i++) {
        total += objective[`semiAnnual${i}`] || 0;
        
        if (objective.typeOfComputation === "non-cumulative" && 
            objective[`semiAnnual${i}Date`] && 
            objective[`semiAnnual${i}`] !== 0) {
          const semiAnnualDate = new Date(objective[`semiAnnual${i}Date`]);
          const semiAnnualDateSet = semiAnnualDate.getMonth();
          updatedObjective.monthPointer = semiAnnualDateSet;
          updatedObjective.monthPointerValue[`monthPointer_${semiAnnualDateSet}`] = objective[`semiAnnual${i}`] || 0;
        }

        if (objective.typeOfComputation === "cumulative") {
          if (objective[`goalSemiAnnual${i}`]) {
            totalGoalsSet += objective[`goalSemiAnnual${i}`] || 0;
          }
        }
      }
    } else if (objective.frequencyMonitoring === "yearly") {
      total += objective.yearly0 || 0;
      
      if (objective.typeOfComputation === "non-cumulative" && 
          objective.yearly0Date && 
          objective.yearly0 !== 0) {
        const yearlyDate = new Date(objective.yearly0Date);
        const yearlyDateSet = yearlyDate.getMonth();
        updatedObjective.monthPointer = yearlyDateSet;
        updatedObjective.monthPointerValue[`monthPointer_${yearlyDateSet}`] = objective.yearly0 || 0;
      }
    }

    // Calculate percentage
    const percentage = target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 0;
    updatedObjective.percentage = percentage;
    updatedObjective.total = total;
    updatedObjective.totalGoalsSet = totalGoalsSet;

    return formatObjective(updatedObjective);
  });
}

// Check if objective is complete based on frequency
function checkObjectiveCompletion(objective, updateData) {
  let isComplete = true;
  const freq = objective.frequencyMonitoring;

  if (freq === "monthly") {
    for (let i = 0; i < 12; i++) {
      if (objective[`goalMonth${i}`] !== updateData[`month${i}`]) {
        isComplete = false;
        break;
      }
    }
  } else if (freq === "quarterly") {
    for (let i = 0; i < 4; i++) {
      if (objective[`goalQuarter${i}`] !== updateData[`quarter${i}`]) {
        isComplete = false;
        break;
      }
    }
  } else if (freq === "semi_annual") {
    for (let i = 0; i < 2; i++) {
      if (objective[`goalSemiAnnual${i}`] !== updateData[`semiAnnual${i}`]) {
        isComplete = false;
        break;
      }
    }
  } else {
    if (objective.goalYear0 !== updateData.yearly0) {
      isComplete = false;
    }
  }

  return isComplete;
}

module.exports = (router) => {
  // Get objectives for calendar
  router.get("/getObjectiveForCalendar", async (req, res) => {
    try {
      const objectives = await prisma.objective.findMany({
        where: { deleted: false },
        include: {
          goal: {
            select: { goals: true },
          },
          creator: {
            select: {
              username: true,
              profilePic: true,
              department: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const data = objectives.map((obj) => ({
        id: obj.visibleId,
        goals: obj.goal ? { goals: obj.goal.goals } : null,
        timetable: obj.timetable,
        users: obj.creator ? {
          username: obj.creator.username,
          profile_pic: obj.creator.profilePic,
          department: obj.creator.department,
        } : null,
      }));

      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all objectives with goals and users
  router.get("/getAllByIdObjectivesWithGoalsAndUsers", async (req, res) => {
    try {
      const objectives = await prisma.objective.findMany({
        where: { deleted: false },
        include: {
          goal: {
            select: {
              visibleId: true,
              goals: true,
              budget: true,
              department: true,
              campus: true,
            },
          },
          creator: {
            select: {
              visibleId: true,
              username: true,
              firstname: true,
              lastname: true,
              email: true,
              department: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const data = objectives.map((obj) => ({
        ...formatObjective(obj),
        goals: obj.goal ? {
          id: obj.goal.visibleId,
          goals: obj.goal.goals,
          budget: obj.goal.budget,
          department: obj.goal.department,
          campus: obj.goal.campus,
        } : null,
        users: obj.creator ? {
          id: obj.creator.visibleId,
          username: obj.creator.username,
          firstname: obj.creator.firstname,
          lastname: obj.creator.lastname,
          email: obj.creator.email,
          department: obj.creator.department,
          role: obj.creator.role?.toLowerCase().replace('_', '-'),
        } : null,
      }));

      res.status(200).json({ success: true, data });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get total objectives budget
  router.get("/getAllObjectivesBudget", async (req, res) => {
    try {
      const result = await prisma.objective.aggregate({
        where: { deleted: false },
        _sum: { budget: true },
      });

      res.json({
        success: true,
        data: result._sum.budget || 0,
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get objectives for dashboard
  router.get("/getAllObjectivesForDashboard", async (req, res) => {
    try {
      const [objectivesCount, objectiveCompleted, objectiveUncompleted, objectivesData] = 
        await Promise.all([
          prisma.objective.count({ where: { deleted: false } }),
          prisma.objective.count({ where: { complete: true, deleted: false } }),
          prisma.objective.count({ where: { complete: false, deleted: false } }),
          prisma.objective.findMany({
            where: { deleted: false },
            select: {
              visibleId: true,
              complete: true,
              dateAdded: true,
            },
          }),
        ]);

      res.json({
        success: true,
        data: [{
          objectivesCount,
          objectiveCompleted,
          objectiveUncompleted,
          objectivesData: objectivesData.map((o) => ({
            id: o.visibleId,
            complete: o.complete,
            date_added: o.dateAdded,
          })),
        }],
      });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Toggle objective completion
  router.put("/updateobjectivecompletion", async (req, res) => {
    try {
      const { id } = req.body;

      const objective = await prisma.objective.findFirst({
        where: { visibleId: id },
      });

      if (!objective) {
        return res.json({ success: false, message: "Objective not found" });
      }

      const updated = await prisma.objective.update({
        where: { id: objective.id },
        data: { complete: !objective.complete },
      });

      res.json({
        success: true,
        message: "Successfully Changed",
        data: formatObjective(updated),
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get objectives by goal ID
  router.get("/getAllByIdObjectives/:id", async (req, res) => {
    try {
      const objectives = await prisma.objective.findMany({
        where: {
          goalVisibleId: req.params.id,
          deleted: false,
        },
        include: {
          remarks: true,
        },
      });

      if (!objectives || objectives.length === 0) {
        return res.json({
          success: false,
          message: "No Objectives found.",
          Objectives: [],
        });
      }

      const processedObjectives = await calculatePercentage(objectives);

      res.status(200).json({
        success: true,
        Objectives: processedObjectives,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get objective by ID
  router.get("/getObjectiveById/:id", async (req, res) => {
    try {
      const objective = await prisma.objective.findFirst({
        where: { visibleId: req.params.id },
      });

      if (!objective) {
        return res.json({ success: false, message: "Objective not found." });
      }

      res.json({ success: true, data: formatObjective(objective) });
    } catch (err) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Delete objective (hard delete)
  router.put("/deleteObjectives", async (req, res) => {
    try {
      const { id } = req.body;

      await prisma.objective.delete({
        where: { visibleId: id },
      });

      res.json({
        success: true,
        message: "Successfully Deleted the Objectives",
      });
    } catch (err) {
      res.json({ success: false, message: "Could not Delete Objectives: " + err.message });
    }
  });

  // Soft delete/deactivate objective
  router.put("/setInactiveObjectives", async (req, res) => {
    try {
      const { id } = req.body;

      const objective = await prisma.objective.findFirst({
        where: { visibleId: id },
      });

      if (!objective) {
        return res.json({ success: false, message: "Objective not found" });
      }

      // Update objective to deleted
      const updatedObjective = await prisma.objective.update({
        where: { id: objective.id },
        data: { deleted: true, status: "inactive" },
      });

      // Update related files
      await prisma.fileUpload.updateMany({
        where: {
          for: "files",
          status: true,
          objectiveId: id,
        },
        data: { status: false },
      });

      res.json({
        success: true,
        message: "Successfully deleted objectives including its files...",
        data: formatObjective(updatedObjective),
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Toggle objective status
  router.put("/changeObjectivesStatus", async (req, res) => {
    try {
      const { id } = req.body;

      const objective = await prisma.objective.findFirst({
        where: { visibleId: id },
      });

      if (!objective) {
        return res.json({ success: false, message: "Objective not found" });
      }

      const newStatus = objective.status === "active" ? "inactive" : "active";

      const updated = await prisma.objective.update({
        where: { id: objective.id },
        data: { status: newStatus },
      });

      res.json({
        success: true,
        message: "Successfully set Objectives Status",
        data: formatObjective(updated),
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Update objective
  router.put("/updateObjectives", async (req, res) => {
    try {
      const { id, ...updateFields } = req.body;

      const objective = await prisma.objective.findFirst({
        where: { visibleId: id },
      });

      if (!objective) {
        return res.status(404).json({
          success: false,
          message: "Objective not found",
        });
      }

      // Map frontend field names to Prisma field names
      const updateData = {};
      
      // Handle basic fields
      if (updateFields.functional_objective !== undefined) updateData.functionalObjective = updateFields.functional_objective;
      if (updateFields.performance_indicator !== undefined) updateData.performanceIndicator = updateFields.performance_indicator;
      if (updateFields.target !== undefined) updateData.target = parseFloat(updateFields.target);
      if (updateFields.formula !== undefined) updateData.formula = updateFields.formula;
      if (updateFields.programs !== undefined) updateData.programs = updateFields.programs;
      if (updateFields.responsible_persons !== undefined) updateData.responsiblePersons = updateFields.responsible_persons;
      if (updateFields.clients !== undefined) updateData.clients = updateFields.clients;
      if (updateFields.remarks !== undefined) updateData.remarks = updateFields.remarks;
      if (updateFields.frequency_monitoring !== undefined) updateData.frequencyMonitoring = updateFields.frequency_monitoring;
      if (updateFields.type_of_computation !== undefined) updateData.typeOfComputation = updateFields.type_of_computation;
      if (updateFields.timetable !== undefined) updateData.timetable = updateFields.timetable ? new Date(updateFields.timetable) : null;
      if (updateFields.data_source !== undefined) updateData.dataSource = updateFields.data_source;
      if (updateFields.budget !== undefined) updateData.budget = parseFloat(updateFields.budget);
      if (updateFields.strategic_objective !== undefined) updateData.strategicObjective = updateFields.strategic_objective;
      if (updateFields.updateby !== undefined) updateData.updateBy = updateFields.updateby;
      updateData.updateDate = new Date();

      // Handle monthly fields
      for (let i = 0; i < 12; i++) {
        if (updateFields[`month_${i}`] !== undefined) updateData[`month${i}`] = parseFloat(updateFields[`month_${i}`]) || 0;
        if (updateFields[`month_${i}_date`] !== undefined) updateData[`month${i}Date`] = updateFields[`month_${i}_date`] ? new Date(updateFields[`month_${i}_date`]) : null;
        if (updateFields[`file_month_${i}`] !== undefined) updateData[`fileMonth${i}`] = updateFields[`file_month_${i}`];
        if (updateFields[`goal_month_${i}`] !== undefined) updateData[`goalMonth${i}`] = parseFloat(updateFields[`goal_month_${i}`]) || 0;
      }

      // Handle quarterly fields
      for (let i = 0; i < 4; i++) {
        if (updateFields[`quarter_${i}`] !== undefined) updateData[`quarter${i}`] = parseFloat(updateFields[`quarter_${i}`]) || 0;
        if (updateFields[`quarter_${i}_date`] !== undefined) updateData[`quarter${i}Date`] = updateFields[`quarter_${i}_date`] ? new Date(updateFields[`quarter_${i}_date`]) : null;
        if (updateFields[`file_quarter_${i}`] !== undefined) updateData[`fileQuarter${i}`] = updateFields[`file_quarter_${i}`];
        if (updateFields[`goal_quarter_${i}`] !== undefined) updateData[`goalQuarter${i}`] = parseFloat(updateFields[`goal_quarter_${i}`]) || 0;
      }

      // Handle semi-annual fields
      for (let i = 0; i < 3; i++) {
        if (updateFields[`semi_annual_${i}`] !== undefined) updateData[`semiAnnual${i}`] = parseFloat(updateFields[`semi_annual_${i}`]) || 0;
        if (updateFields[`semi_annual_${i}_date`] !== undefined) updateData[`semiAnnual${i}Date`] = updateFields[`semi_annual_${i}_date`] ? new Date(updateFields[`semi_annual_${i}_date`]) : null;
        if (updateFields[`file_semi_annual_${i}`] !== undefined) updateData[`fileSemiAnnual${i}`] = updateFields[`file_semi_annual_${i}`];
        if (updateFields[`goal_semi_annual_${i}`] !== undefined) updateData[`goalSemiAnnual${i}`] = parseFloat(updateFields[`goal_semi_annual_${i}`]) || 0;
      }

      // Handle yearly fields
      if (updateFields.yearly_0 !== undefined) updateData.yearly0 = parseFloat(updateFields.yearly_0) || 0;
      if (updateFields.yearly_0_date !== undefined) updateData.yearly0Date = updateFields.yearly_0_date ? new Date(updateFields.yearly_0_date) : null;
      if (updateFields.file_year_0 !== undefined) updateData.fileYear0 = updateFields.file_year_0;
      if (updateFields.goal_year_0 !== undefined) updateData.goalYear0 = parseFloat(updateFields.goal_year_0) || 0;

      // Check if complete
      const updatedObj = { ...objective, ...updateData };
      updateData.complete = checkObjectiveCompletion(objective, updateData);

      const result = await prisma.objective.update({
        where: { id: objective.id },
        data: updateData,
      });

      res.status(200).json({
        success: true,
        message: "Objective updated successfully",
        data: formatObjective(result),
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Add objective
  router.post("/addObjectives", async (req, res) => {
    try {
      const {
        functional_objective,
        performance_indicator,
        target,
        formula,
        programs,
        responsible_persons,
        clients,
        remarks,
        frequency_monitoring,
        type_of_computation,
        timetable,
        data_source,
        budget,
        createdBy,
        goalId,
        strategic_objective,
        ...monthlyData
      } = req.body;

      // Prepare data for creation
      const createData = {
        visibleId: uuidv4(),
        functionalObjective: functional_objective || '',
        performanceIndicator: performance_indicator || '',
        target: parseFloat(target) || 0,
        formula: formula || '',
        programs: programs || '',
        responsiblePersons: responsible_persons || '',
        clients: clients || '',
        remarks: remarks || '',
        frequencyMonitoring: frequency_monitoring || 'monthly',
        typeOfComputation: type_of_computation || 'non-cumulative',
        timetable: timetable ? new Date(timetable) : null,
        dataSource: data_source || '',
        budget: parseFloat(budget) || 0,
        createdBy: createdBy || '',
        goalVisibleId: goalId || null,
        strategicObjective: strategic_objective || '',
        dateAdded: new Date(),
        status: 'active',
      };

      // Handle monthly fields
      for (let i = 0; i < 12; i++) {
        if (monthlyData[`month_${i}`] !== undefined) createData[`month${i}`] = parseFloat(monthlyData[`month_${i}`]) || 0;
        if (monthlyData[`goal_month_${i}`] !== undefined) createData[`goalMonth${i}`] = parseFloat(monthlyData[`goal_month_${i}`]) || 0;
      }

      // Handle quarterly fields
      for (let i = 0; i < 4; i++) {
        if (monthlyData[`quarter_${i}`] !== undefined) createData[`quarter${i}`] = parseFloat(monthlyData[`quarter_${i}`]) || 0;
        if (monthlyData[`goal_quarter_${i}`] !== undefined) createData[`goalQuarter${i}`] = parseFloat(monthlyData[`goal_quarter_${i}`]) || 0;
      }

      // Handle semi-annual fields
      for (let i = 0; i < 3; i++) {
        if (monthlyData[`semi_annual_${i}`] !== undefined) createData[`semiAnnual${i}`] = parseFloat(monthlyData[`semi_annual_${i}`]) || 0;
        if (monthlyData[`goal_semi_annual_${i}`] !== undefined) createData[`goalSemiAnnual${i}`] = parseFloat(monthlyData[`goal_semi_annual_${i}`]) || 0;
      }

      // Handle yearly fields
      if (monthlyData.yearly_0 !== undefined) createData.yearly0 = parseFloat(monthlyData.yearly_0) || 0;
      if (monthlyData.goal_year_0 !== undefined) createData.goalYear0 = parseFloat(monthlyData.goal_year_0) || 0;

      // Find the goal if goalId is provided
      if (goalId) {
        const goal = await prisma.goal.findFirst({
          where: { visibleId: goalId },
        });
        if (goal) {
          createData.goalId = goal.id;
        }
      }

      const objective = await prisma.objective.create({
        data: createData,
      });

      res.json({
        success: true,
        message: "Objective created successfully",
        data: formatObjective(objective),
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  return router;
};
