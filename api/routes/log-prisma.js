/**
 * Logs Routes - Prisma/MySQL Version
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");

// Helper function to remove word from text and determine action
function removeWord(text, wordToRemove) {
  if (text === "updateobjectivecompletion") {
    return "changed status of";
  }
  if (text === "addMultipleFiles") {
    return "added";
  }
  if (text === "setInactiveObjectives") {
    return "deleted";
  }
  if (text === "deleteFileObjective") {
    return "deleted";
  }

  const regex = new RegExp(wordToRemove, "gi");
  return text.replace(regex, "");
}

module.exports = (router) => {
  // Get all logs
  router.get("/getAllLogs/:id", async (req, res) => {
    try {
      const logs = await prisma.log.findMany({
        where: {
          method: { not: "GET" },
          deleted: false,
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedLogs = logs.map((log) => {
        const pathSegments = log.url ? log.url.split("/") : [];
        return {
          _id: log.id,
          id: log.visibleId,
          method: log.method,
          url: log.url,
          params: log.params ? JSON.parse(log.params) : {},
          query: log.query ? JSON.parse(log.query) : {},
          body: log.body ? JSON.parse(log.body) : {},
          statusCode: log.statusCode,
          ip: log.ip,
          timestamp: log.timestamp,
          createdAt: log.createdAt,
          resource: pathSegments[1] === "fileupload" ? "file" : (pathSegments[1] || ""),
          actionTaken: pathSegments[2] || "",
          actionMade: pathSegments[2] ? removeWord(pathSegments[2], pathSegments[1] || "") : "",
        };
      });

      res.json({ success: true, data: [formattedLogs] });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Create a log entry
  router.post("/logs", async (req, res) => {
    try {
      const { method, url, params, query, body, statusCode, ip } = req.body;

      const log = await prisma.log.create({
        data: {
          visibleId: uuidv4(),
          method,
          url,
          params: params ? JSON.stringify(params) : null,
          query: query ? JSON.stringify(query) : null,
          body: body ? JSON.stringify(body) : null,
          statusCode,
          ip,
          timestamp: new Date(),
        },
      });

      res.status(201).json({ success: true, log });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Delete log (soft delete)
  router.delete("/logs/:id", async (req, res) => {
    try {
      await prisma.log.update({
        where: { visibleId: req.params.id },
        data: { deleted: true },
      });

      res.json({ success: true, message: "Log deleted" });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  return router;
};
