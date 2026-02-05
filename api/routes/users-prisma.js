/**
 * Users Routes - Prisma/MySQL Version
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

// Helper function for pagination
const parsePaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Map role enum to string
const mapEnumToRole = (enumRole) => {
  const roleMap = {
    'ADMIN': 'admin',
    'PRESIDENT': 'president',
    'VICE_PRESIDENT': 'vice-president',
    'DIRECTOR': 'director',
    'OFFICE_HEAD': 'office-head'
  };
  return roleMap[enumRole] || 'office-head';
};

// Map role string to enum
const mapRoleToEnum = (role) => {
  const roleMap = {
    'admin': 'ADMIN',
    'president': 'PRESIDENT',
    'vice-president': 'VICE_PRESIDENT',
    'director': 'DIRECTOR',
    'office-head': 'OFFICE_HEAD'
  };
  return roleMap[role?.toLowerCase()] || 'OFFICE_HEAD';
};

// Helper to format user for response
const formatUser = (user) => ({
  id: user.visibleId,
  email: user.email,
  username: user.username,
  firstname: user.firstname,
  lastname: user.lastname,
  campus: user.campus,
  department: user.department,
  role: mapEnumToRole(user.role),
  status: user.status,
  profile_pic: user.profilePic,
  department_id: user.departmentId,
  vice_president_id: user.vicePresidentId,
  vice_president_name: user.vicePresidentName,
  director_id: user.directorId,
  director_name: user.directorName,
  office_head_id: user.officeHeadId,
  office_head_name: user.officeHeadName,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

module.exports = (router) => {
  // Get all vice presidents
  router.get("/getAllVicePresident", async (req, res) => {
    try {
      const vicePresidents = await prisma.user.findMany({
        where: {
          role: "VICE_PRESIDENT",
          deleted: false,
        },
      });

      const data = vicePresidents.map((e) => ({
        name: e.department?.replace(/\b\w/g, (char) => char.toUpperCase()) || '',
        code: e.department || '',
        id: e.visibleId,
        firstname: e.firstname,
        lastname: e.lastname,
        fullname: `${e.firstname?.replace(/\b\w/g, (char) => char.toUpperCase()) || ''} ${e.lastname?.replace(/\b\w/g, (char) => char.toUpperCase()) || ''}`.trim(),
        _id: e.id,
      }));

      res.status(200).json({ success: true, data: [data] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get all users
  router.get("/getAllUsers", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        where: { deleted: false },
      });

      const data = users.map((e) => ({
        department: e.department?.replace(/\b\w/g, (char) => char.toUpperCase()) || '',
        code: e.visibleId,
        firstname: e.firstname,
        lastname: e.lastname,
        name: `${e.firstname?.replace(/\b\w/g, (char) => char.toUpperCase()) || ''} ${e.lastname?.replace(/\b\w/g, (char) => char.toUpperCase()) || ''}`.trim(),
        _id: e.id,
      }));

      res.status(200).json({ success: true, data: [data] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get all directors
  router.get("/getAllDirector", async (req, res) => {
    try {
      const directors = await prisma.user.findMany({
        where: {
          role: "DIRECTOR",
          deleted: false,
        },
      });

      const data = directors.map((e) => ({
        name: e.department?.replace(/\b\w/g, (char) => char.toUpperCase()) || '',
        code: e.department || '',
        id: e.visibleId,
        firstname: e.firstname,
        lastname: e.lastname,
        fullname: `${e.firstname?.replace(/\b\w/g, (char) => char.toUpperCase()) || ''} ${e.lastname?.replace(/\b\w/g, (char) => char.toUpperCase()) || ''}`.trim(),
        _id: e.id,
      }));

      res.status(200).json({ success: true, data: [data] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get users stats for dashboard
  router.get("/getAllUsersForDashboard", async (req, res) => {
    try {
      const [adminCount, vicePresidentCount, directorCount, officeHeadCount, documentCount] = 
        await Promise.all([
          prisma.user.count({ where: { deleted: false, role: "ADMIN" } }),
          prisma.user.count({ where: { deleted: false, role: "VICE_PRESIDENT" } }),
          prisma.user.count({ where: { deleted: false, role: "DIRECTOR" } }),
          prisma.user.count({ where: { deleted: false, role: "OFFICE_HEAD" } }),
          prisma.user.count({ where: { deleted: false } }),
        ]);

      res.json({
        success: true,
        data: [{
          admin: adminCount,
          vice_president: vicePresidentCount,
          director: directorCount,
          office_head: officeHeadCount,
          document: documentCount,
        }],
      });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get all users for admin departments dropdown
  router.get("/getAllUsersAdminDepartments", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        where: { deleted: false },
        select: {
          id: true,
          visibleId: true,
          email: true,
          username: true,
          department: true,
          role: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedUsers = users.map((user) => ({
        name: user.username || user.email,
        code: user.visibleId,
        email: user.email,
        department: user.department,
        role: mapEnumToRole(user.role),
        status: user.status,
      }));

      res.json({ success: true, users: formattedUsers });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get all users except logged in user (with pagination)
  router.get("/getAllUsersExceptLoggedIn/:id", async (req, res) => {
    try {
      const { page, limit, skip } = parsePaginationParams(req.query);

      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where: {
            visibleId: { not: req.params.id },
            deleted: false,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.user.count({
          where: {
            visibleId: { not: req.params.id },
            deleted: false,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const mappedUsers = users.map(formatUser);

      res.json({
        success: true,
        users: mappedUsers,
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

  // Get user by ID
  router.post("/findById", async (req, res) => {
    try {
      const user = await prisma.user.findFirst({
        where: { visibleId: req.body.id },
      });

      if (!user) {
        return res.json({ success: false, message: "No User found." });
      }

      res.json({ success: true, user: formatUser(user) });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get user profile
  router.get("/profile/:id", async (req, res) => {
    try {
      const user = await prisma.user.findFirst({
        where: { visibleId: req.params.id },
      });

      if (!user) {
        return res.json({ success: false, message: "No User found." });
      }

      res.json({ success: true, user: formatUser(user) });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Add new user
  router.post("/addUser", async (req, res) => {
    try {
      const { email, username, password, firstname, lastname, campus, department, role } = req.body;

      if (!email || !username || !password) {
        return res.json({
          success: false,
          message: "Email, username, and password are required",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          visibleId: uuidv4(),
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          password: hashedPassword,
          firstname: firstname || '',
          lastname: lastname || '',
          campus: campus || 'Talisay',
          department: department || '',
          role: mapRoleToEnum(role),
          status: 'pending',
        },
      });

      res.json({
        success: true,
        message: "User added successfully",
        user: formatUser(user),
      });
    } catch (err) {
      if (err.code === "P2002") {
        const field = err.meta?.target?.[0] || 'field';
        return res.json({
          success: false,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        });
      }
      res.json({ success: false, message: err.message });
    }
  });

  // Update user
  router.put("/updateUser", async (req, res) => {
    try {
      const { id, email, username, firstname, lastname, campus, department, role, status } = req.body;

      if (!id) {
        return res.json({ success: false, message: "User ID is required" });
      }

      const updateData = {};
      if (email) updateData.email = email.toLowerCase();
      if (username) updateData.username = username.toLowerCase();
      if (firstname !== undefined) updateData.firstname = firstname;
      if (lastname !== undefined) updateData.lastname = lastname;
      if (campus) updateData.campus = campus;
      if (department !== undefined) updateData.department = department;
      if (role) updateData.role = mapRoleToEnum(role);
      if (status) updateData.status = status;

      const user = await prisma.user.update({
        where: { visibleId: id },
        data: updateData,
      });

      res.json({
        success: true,
        message: "User updated successfully",
        user: formatUser(user),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.json({ success: false, message: "User not found" });
      }
      if (err.code === "P2002") {
        return res.json({ success: false, message: "Email or username already exists" });
      }
      res.json({ success: false, message: err.message });
    }
  });

  // Update user by admin (with department head assignment)
  router.put("/updateUserAdmin", async (req, res) => {
    try {
      const { id, email, username, password, confirm, firstname, lastname, campus, department, department_id, role, status } = req.body;

      if (!id) {
        return res.json({ success: false, message: "User ID is required" });
      }

      const user = await prisma.user.findFirst({
        where: { visibleId: id },
      });

      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      const updateData = {};
      if (email) updateData.email = email.toLowerCase();
      if (username) updateData.username = username.toLowerCase();
      if (firstname !== undefined) updateData.firstname = firstname;
      if (lastname !== undefined) updateData.lastname = lastname;
      if (campus) updateData.campus = campus;
      if (department !== undefined) updateData.department = department;
      if (role) {
        // Map president to admin
        const finalRole = role === 'president' ? 'admin' : role;
        updateData.role = mapRoleToEnum(finalRole);
      }
      if (status) updateData.status = status;

      // Handle password change if provided
      if (password && confirm && password.trim() !== "") {
        if (password !== confirm) {
          return res.json({ success: false, message: "Passwords do not match" });
        }
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // Update department head if department_id is provided
      if (department_id) {
        await prisma.department.updateMany({
          where: { visibleId: department_id },
          data: {
            departmentHead: username || updatedUser.username,
            userId: id,
          },
        });
      }

      res.json({
        success: true,
        message: "User information has been updated!",
        data: formatUser(updatedUser),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.json({ success: false, message: "Email or username already exists" });
      }
      res.json({ success: false, message: err.message });
    }
  });

  // Update user status
  router.put("/updateUserStatus", async (req, res) => {
    try {
      const { id, status } = req.body;

      if (!id || !status) {
        return res.json({ success: false, message: "User ID and status are required" });
      }

      const user = await prisma.user.update({
        where: { visibleId: id },
        data: { status },
      });

      res.json({
        success: true,
        message: "User status updated successfully",
        user: formatUser(user),
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Change user status (toggle between pending/active/inactive)
  router.put("/changeUserStatus", async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) {
        return res.json({ success: false, message: "User ID is required" });
      }

      const user = await prisma.user.findFirst({
        where: { visibleId: id },
      });

      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      // Toggle status: pending -> active -> inactive -> active
      const newStatus = user.status === "pending" 
        ? "active" 
        : user.status === "active" 
          ? "inactive" 
          : "active";

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { status: newStatus },
      });

      res.json({
        success: true,
        message: "Successfully User set Status",
        data: formatUser(updatedUser),
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Update profile (for user self-update)
  router.put("/updateProfile", async (req, res) => {
    try {
      const { id, username, email, firstname, lastname, profile_pic, password, confirmPassword, old_password } = req.body;

      if (!id) {
        return res.json({ success: false, message: "User ID is required" });
      }

      const user = await prisma.user.findFirst({
        where: { visibleId: id },
      });

      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      // Check if password change is requested
      if (confirmPassword && confirmPassword.trim() !== "") {
        // Validate password match
        if (password !== confirmPassword) {
          return res.json({
            success: false,
            message: "Password not match : " + password + " for " + username,
          });
        }

        // Verify old password
        const checkPassword = await bcrypt.compare(old_password, user.password);
        if (!checkPassword) {
          return res.json({
            success: false,
            message: "Incorrect Old Password : " + password + " for " + username,
          });
        }

        // Hash new password and update with all fields
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            username: username?.toLowerCase() || user.username,
            email: email?.toLowerCase() || user.email,
            firstname: firstname || user.firstname,
            lastname: lastname || user.lastname,
            profilePic: profile_pic || user.profilePic,
            password: hashedPassword,
          },
        });

        return res.json({
          success: true,
          message: "User Information has been updated!",
          data: formatUser(updatedUser),
        });
      } else {
        // Update without password change
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            username: username?.toLowerCase() || user.username,
            email: email?.toLowerCase() || user.email,
            firstname: firstname || user.firstname,
            lastname: lastname || user.lastname,
            profilePic: profile_pic || user.profilePic,
          },
        });

        return res.json({
          success: true,
          message: "User Information has been updated!",
          data: formatUser(updatedUser),
        });
      }
    } catch (err) {
      if (err.code === "P2002") {
        return res.json({ success: false, message: "Email or username already exists" });
      }
      res.json({ success: false, message: err.message });
    }
  });

  // Set user inactive (soft delete - used by frontend)
  router.put("/setInactiveUser", async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) {
        return res.json({ success: false, message: "User ID is required" });
      }

      const user = await prisma.user.findFirst({
        where: { visibleId: id },
      });

      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { 
          deleted: true, 
          status: "inactive" 
        },
      });

      res.json({ 
        success: true, 
        message: "Successfully Delete User",
        data: formatUser(user),
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Soft delete user
  router.delete("/deleteUser/:id", async (req, res) => {
    try {
      await prisma.user.update({
        where: { visibleId: req.params.id },
        data: { deleted: true },
      });

      res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.json({ success: false, message: "User not found" });
      }
      res.json({ success: false, message: err.message });
    }
  });

  // Change password
  router.put("/changePassword", async (req, res) => {
    try {
      const { id, currentPassword, newPassword } = req.body;

      if (!id || !currentPassword || !newPassword) {
        return res.json({
          success: false,
          message: "User ID, current password, and new password are required",
        });
      }

      const user = await prisma.user.findFirst({
        where: { visibleId: id },
      });

      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.json({ success: false, message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      res.json({ success: true, message: "Password changed successfully" });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get users by role
  router.get("/getUsersByRole/:role", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          role: mapRoleToEnum(req.params.role),
          deleted: false,
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        success: true,
        users: users.map(formatUser),
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Get users by department
  router.get("/getUsersByDepartment/:department", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          department: req.params.department,
          deleted: false,
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        success: true,
        users: users.map(formatUser),
      });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  return router;
};
