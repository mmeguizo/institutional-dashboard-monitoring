/**
 * Campus Routes - Prisma/MySQL Version
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");

module.exports = (router) => {
  // Get all campuses for dropdown
  router.get("/getAllCampus", async (req, res) => {
    try {
      const campuses = await prisma.campus.findMany({
        where: { deleted: false },
      });

      const data = campuses.map((c) => ({
        name: c.campusName,
        code: c.campusName,
      }));

      res.json({ success: true, data: [data] });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get all campuses (full data)
  router.get("/campuses", async (req, res) => {
    try {
      const campuses = await prisma.campus.findMany({
        where: { deleted: false },
        orderBy: { createdAt: "desc" },
      });

      const data = campuses.map((c) => ({
        _id: c.id,
        id: c.visibleId,
        campusName: c.campusName,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      res.json({ success: true, data });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Add campus
  router.post("/campus", async (req, res) => {
    try {
      const { campusName } = req.body;

      if (!campusName) {
        return res.json({ success: false, message: "Campus name is required" });
      }

      const campus = await prisma.campus.create({
        data: {
          visibleId: uuidv4(),
          campusName,
        },
      });

      res.json({
        success: true,
        message: "Campus added successfully",
        data: {
          _id: campus.id,
          id: campus.visibleId,
          campusName: campus.campusName,
        },
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.json({ success: false, message: "Campus already exists" });
      }
      res.json({ success: false, message: error.message });
    }
  });

  // Update campus
  router.put("/campus/:id", async (req, res) => {
    try {
      const { campusName } = req.body;

      const campus = await prisma.campus.update({
        where: { visibleId: req.params.id },
        data: { campusName },
      });

      res.json({
        success: true,
        message: "Campus updated successfully",
        data: {
          _id: campus.id,
          id: campus.visibleId,
          campusName: campus.campusName,
        },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.json({ success: false, message: "Campus not found" });
      }
      res.json({ success: false, message: error.message });
    }
  });

  // Delete campus (soft delete)
  router.delete("/campus/:id", async (req, res) => {
    try {
      await prisma.campus.update({
        where: { visibleId: req.params.id },
        data: { deleted: true },
      });

      res.json({ success: true, message: "Campus deleted successfully" });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  return router;
};
