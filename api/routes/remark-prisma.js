/**
 * Remarks Routes - Prisma/MySQL Version
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");

module.exports = (router) => {
  // Get remarks by objective ID
  router.get("/remarks/:objectiveId", async (req, res) => {
    try {
      const remarks = await prisma.remark.findMany({
        where: {
          objectiveId: req.params.objectiveId,
          deleted: false,
        },
        include: {
          user: {
            select: {
              firstname: true,
              lastname: true,
              visibleId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedRemarks = remarks.map((r) => ({
        _id: r.id,
        id: r.visibleId,
        remarks: r.remarks,
        userId: r.userId,
        objectiveId: r.objectiveId,
        createdAt: r.createdAt,
        users: r.user ? {
          id: r.user.visibleId,
          firstname: r.user.firstname,
          lastname: r.user.lastname,
        } : null,
      }));

      res.status(200).json(formattedRemarks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create a new remark
  router.post("/remarks", async (req, res) => {
    try {
      const userDecoded = req.decoded;
      const { remarks, objectiveId, userId } = req.body;

      // Create the remark
      const newRemark = await prisma.remark.create({
        data: {
          visibleId: uuidv4(),
          remarks,
          objectiveId,
          userId: userId || userDecoded?.id,
        },
      });

      // Find related data for notification
      const objective = await prisma.objective.findFirst({
        where: { visibleId: objectiveId },
      });

      const userDetails = await prisma.user.findFirst({
        where: { visibleId: userId },
      });

      const president = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });

      let goalDetails = null;
      if (objective?.goalVisibleId) {
        goalDetails = await prisma.goal.findFirst({
          where: { visibleId: objective.goalVisibleId },
        });
      }

      // Determine recipient based on role
      let reciepientData = "";

      if (userDecoded?.role === "office-head") {
        reciepientData = userDecoded.director_id;
      } else if (userDecoded?.role === "director") {
        reciepientData = objective?.createdBy;
        if (userDecoded.id === objective?.createdBy) {
          reciepientData = userDecoded.vice_president_id;
        }
      } else if (userDecoded?.role === "vice-president") {
        reciepientData = objective?.createdBy;
        if (userDecoded.id === objective?.createdBy) {
          reciepientData = president?.visibleId;
        }
      } else {
        reciepientData = objective?.createdBy;
      }

      // Create notification
      await prisma.notification.create({
        data: {
          visibleId: uuidv4(),
          userId: userDecoded?.id,
          message: "New remark added to objective",
          type: "remark_added",
          reciepient: reciepientData || null,
          metadata: JSON.stringify(newRemark),
          goalDetails: goalDetails ? JSON.stringify(goalDetails) : null,
          objectiveDetails: objective ? JSON.stringify(objective) : null,
          userDetails: userDecoded ? JSON.stringify(userDecoded) : null,
        },
      });

      // Return user details
      res.status(201).json(userDetails ? {
        id: userDetails.visibleId,
        firstname: userDetails.firstname,
        lastname: userDetails.lastname,
        email: userDetails.email,
        department: userDetails.department,
      } : newRemark);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update a remark
  router.put("/remarks/:id", async (req, res) => {
    try {
      const { remarks } = req.body;

      const updatedRemark = await prisma.remark.update({
        where: { visibleId: req.params.id },
        data: { remarks },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          visibleId: uuidv4(),
          userId: req.decoded?.id,
          message: "Remark updated",
          type: "remark_updated",
          metadata: JSON.stringify(updatedRemark),
        },
      });

      res.status(200).json({
        _id: updatedRemark.id,
        id: updatedRemark.visibleId,
        remarks: updatedRemark.remarks,
        objectiveId: updatedRemark.objectiveId,
        userId: updatedRemark.userId,
        createdAt: updatedRemark.createdAt,
        updatedAt: updatedRemark.updatedAt,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete a remark (soft delete)
  router.delete("/remarks/:id", async (req, res) => {
    try {
      await prisma.remark.update({
        where: { visibleId: req.params.id },
        data: { deleted: true },
      });

      res.status(200).json({ success: true, message: "Remark deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
