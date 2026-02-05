/**
 * Department Routes - Prisma/MySQL Version
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");

// Helper function for pagination
const parsePaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = (router) => {
  // Get all departments for dropdown
  router.get("/getAllDepartmentDropdown", async (req, res) => {
    try {
      const departments = await prisma.department.findMany({
        where: {
          deleted: false,
          status: "active",
        },
        select: {
          id: true,
          visibleId: true,
          department: true,
        },
      });

      const data = departments.map((e) => ({
        name: e.department.replace(/\b\w/g, (char) => char.toUpperCase()),
        code: e.department,
        id: e.visibleId,
      }));

      res.json({ success: true, data: [data] });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get department stats for dashboard
  router.get("/getAllDepartmentForDashboard", async (req, res) => {
    try {
      const [departmentCount, departmentActive, departmentInactive] = await Promise.all([
        prisma.department.count(),
        prisma.department.count({ where: { deleted: false, status: "active" } }),
        prisma.department.count({ where: { deleted: true, status: "inactive" } }),
      ]);

      res.json({
        success: true,
        data: [{
          departmentCount,
          departmentActive,
          departmentInactive,
        }],
      });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get all departments with pagination
  router.get("/getAllDepartment", async (req, res) => {
    try {
      const { page, limit, skip } = parsePaginationParams(req.query);

      const [departments, totalCount] = await Promise.all([
        prisma.department.findMany({
          where: { deleted: false },
          select: {
            id: true,
            visibleId: true,
            department: true,
            status: true,
            deleted: true,
            departmentHead: true,
            userId: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.department.count({ where: { deleted: false } }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      // Map visibleId to id for backward compatibility
      const mappedDepts = departments.map(d => ({
        ...d,
        id: d.visibleId,
        department_head: d.departmentHead,
        user_id: d.userId,
      }));

      res.json({
        success: true,
        departments: mappedDepts,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Legacy endpoint without pagination
  router.get("/getAllDepartmentNoPagination", async (req, res) => {
    try {
      const departments = await prisma.department.findMany({
        where: { deleted: false },
        select: {
          id: true,
          visibleId: true,
          department: true,
          status: true,
          deleted: true,
          departmentHead: true,
          userId: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Map visibleId to id for backward compatibility
      const mappedDepts = departments.map(d => ({
        ...d,
        id: d.visibleId,
        department_head: d.departmentHead,
        user_id: d.userId,
      }));

      res.json({ success: true, departments: mappedDepts });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Find department by ID
  router.post("/findDepartmentById", async (req, res) => {
    try {
      const department = await prisma.department.findFirst({
        where: { visibleId: req.body.id },
        select: {
          id: true,
          visibleId: true,
          department: true,
          status: true,
          departmentHead: true,
          userId: true,
          campus: true,
        },
      });

      if (!department) {
        return res.json({ success: false, message: "No Department found." });
      }

      // Map for backward compatibility
      res.json({
        success: true,
        department: {
          ...department,
          id: department.visibleId,
          department_head: department.departmentHead,
          user_id: department.userId,
        },
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Add new department
  router.post("/addDepartment", async (req, res) => {
    try {
      const { department } = req.body;

      if (!department?.departmentName || department.departmentName.trim() === "") {
        return res.json({
          success: false,
          message: "You must provide a Department Name",
        });
      }

      // Check if department already exists
      const existingDepartment = await prisma.department.findFirst({
        where: { 
          department: department.departmentName.toLowerCase(),
          deleted: false,
        },
      });

      if (existingDepartment) {
        return res.json({
          success: false,
          message: "Department Name already exists",
        });
      }

      const departmentData = {
        visibleId: uuidv4(),
        department: department.departmentName.toLowerCase(),
        departmentHead: department.department_head?.name?.toLowerCase() || "",
        userId: department.department_head?.code?.toLowerCase() || "",
      };

      const newDepartment = await prisma.department.create({
        data: departmentData,
      });

      // Update department head user if provided
      if (departmentData.userId) {
        await prisma.user.updateMany({
          where: { visibleId: departmentData.userId },
          data: {
            department: newDepartment.department,
            departmentId: newDepartment.id,
          },
        });
      }

      res.json({
        success: true,
        message: "Department successfully added",
        data: {
          department: newDepartment.department,
          departmentId: newDepartment.visibleId,
        },
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.json({
          success: false,
          message: "Department Name already exists",
        });
      }
      res.json({ success: false, message: err.message });
    }
  });

  // Update department
  router.put("/updateDepartment", async (req, res) => {
    try {
      const { id, department: deptName, department_head, user_id, status } = req.body;

      if (!id) {
        return res.json({ success: false, message: "Department ID required" });
      }

      const updateData = {};
      if (deptName) updateData.department = deptName.toLowerCase();
      if (department_head !== undefined) updateData.departmentHead = department_head;
      if (user_id !== undefined) updateData.userId = user_id;
      if (status) updateData.status = status;

      const updatedDept = await prisma.department.update({
        where: { visibleId: id },
        data: updateData,
      });

      res.json({
        success: true,
        message: "Department updated successfully",
        department: {
          ...updatedDept,
          id: updatedDept.visibleId,
          department_head: updatedDept.departmentHead,
          user_id: updatedDept.userId,
        },
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.json({ success: false, message: "Department not found" });
      }
      res.json({ success: false, message: err.message });
    }
  });

  // Soft delete department (uses PUT to match frontend)
  router.put("/deleteDepartment", async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) {
        return res.json({ success: false, message: "Department ID required" });
      }

      await prisma.department.update({
        where: { visibleId: id },
        data: { deleted: true, status: "inactive" },
      });

      res.json({
        success: true,
        message: "Successfully Deleted the Department",
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.json({ success: false, message: "Department not found" });
      }
      res.json({ success: false, message: "Could not Delete Department: " + err.message });
    }
  });

  // Assign department head
  router.post("/assignDepartmentHead", async (req, res) => {
    try {
      const { departmentId, userId, userName } = req.body;

      if (!departmentId || !userId) {
        return res.json({
          success: false,
          message: "Department ID and User ID are required",
        });
      }

      // Update department with new head
      const department = await prisma.department.update({
        where: { visibleId: departmentId },
        data: {
          departmentHead: userName || "",
          userId: userId,
        },
      });

      // Update user's department assignment
      await prisma.user.updateMany({
        where: { visibleId: userId },
        data: {
          department: department.department,
          departmentId: department.id,
        },
      });

      res.json({
        success: true,
        message: "Department head assigned successfully",
        department: {
          ...department,
          id: department.visibleId,
        },
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  return router;
};
