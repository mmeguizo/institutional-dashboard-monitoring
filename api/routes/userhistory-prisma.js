/**
 * User History Routes - Prisma/MySQL Version
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");

module.exports = (router) => {
  // Get user history
  router.get("/userhistory/:userId", async (req, res) => {
    try {
      const histories = await prisma.userHistory.findMany({
        where: {
          userId: req.params.userId,
          deleted: false,
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedHistories = histories.map((h) => ({
        _id: h.id,
        id: h.visibleId,
        userId: h.userId,
        action: h.action,
        details: h.details ? JSON.parse(h.details) : {},
        createdAt: h.createdAt,
      }));

      res.status(200).json({ success: true, data: formattedHistories });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Create user history entry
  router.post("/userhistory", async (req, res) => {
    try {
      const { userId, action, details } = req.body;

      const history = await prisma.userHistory.create({
        data: {
          visibleId: uuidv4(),
          userId,
          action,
          details: details ? JSON.stringify(details) : null,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          _id: history.id,
          id: history.visibleId,
          userId: history.userId,
          action: history.action,
          details: history.details ? JSON.parse(history.details) : {},
          createdAt: history.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get all user histories (admin)
  router.get("/userhistories", async (req, res) => {
    try {
      const histories = await prisma.userHistory.findMany({
        where: { deleted: false },
        orderBy: { createdAt: "desc" },
        take: 100, // Limit to last 100 entries
      });

      const formattedHistories = histories.map((h) => ({
        _id: h.id,
        id: h.visibleId,
        userId: h.userId,
        action: h.action,
        details: h.details ? JSON.parse(h.details) : {},
        createdAt: h.createdAt,
      }));

      res.status(200).json({ success: true, data: formattedHistories });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Delete user history (soft delete)
  router.delete("/userhistory/:id", async (req, res) => {
    try {
      await prisma.userHistory.update({
        where: { visibleId: req.params.id },
        data: { deleted: true },
      });

      res.status(200).json({ success: true, message: "History entry deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
};
