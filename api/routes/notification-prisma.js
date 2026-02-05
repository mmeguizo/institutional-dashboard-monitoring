/**
 * Notifications Routes - Prisma/MySQL Version
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");

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

module.exports = (router) => {
  // Get notifications for user
  router.get("/notifications", async (req, res) => {
    try {
      const userId = req.decoded?.id;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  // Get all notifications
  router.get("/getAllnotifications", async (req, res) => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const notifications = await prisma.notification.findMany({
        where: {
          OR: [
            { isRead: false },
            { isRead: true, createdAt: { gte: oneWeekAgo } },
          ],
        },
        orderBy: { isRead: "desc" },
      });

      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  // Get notifications by role
  router.get("/getNotificationsByRole", async (req, res) => {
    try {
      const { role, id } = req.decoded || {};
      
      if (!role || !id) {
        return res.status(400).json({ success: false, message: "Invalid authentication" });
      }

      let userIds = [];

      if (role === "admin") {
        // Admin fetches all notifications
        const notifications = await prisma.notification.findMany({
          include: {
            user: {
              select: {
                visibleId: true,
                username: true,
                firstname: true,
                lastname: true,
                department: true,
                role: true,
              },
            },
            recipient: {
              select: {
                visibleId: true,
                username: true,
                firstname: true,
                lastname: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        const formattedNotifications = notifications.map((n) => ({
          ...n,
          id: n.visibleId,
          from: n.user ? {
            id: n.user.visibleId,
            username: n.user.username,
            firstname: n.user.firstname,
            lastname: n.user.lastname,
            department: n.user.department,
            role: mapEnumToRole(n.user.role),
          } : null,
        }));

        return res.status(200).json({ success: true, notifications: formattedNotifications });
      } else if (role === "vice-president") {
        const usersUnderVP = await prisma.user.findMany({
          where: { vicePresidentId: id },
          select: { visibleId: true },
        });
        userIds = usersUnderVP.map((u) => u.visibleId);
        userIds.push(id);
      } else if (role === "director") {
        const usersUnderDirector = await prisma.user.findMany({
          where: { directorId: id },
          select: { visibleId: true },
        });
        userIds = usersUnderDirector.map((u) => u.visibleId);
        userIds.push(id);
      } else if (role === "office-head") {
        userIds.push(id);
      } else {
        return res.status(400).json({ success: false, message: "Invalid role" });
      }

      let whereCondition;
      
      // Get internal user IDs from visible IDs
      const internalUserIds = await prisma.user.findMany({
        where: { visibleId: { in: userIds } },
        select: { id: true },
      }).then(users => users.map(u => u.id));
      
      // Get current user's internal ID
      const currentUser = await prisma.user.findUnique({
        where: { visibleId: id },
        select: { id: true },
      });
      const currentUserId = currentUser?.id;
      
      if (role === "office-head") {
        whereCondition = {
          OR: [
            { recipientId: currentUserId },
            { userId: currentUserId },
          ],
        };
      } else {
        whereCondition = {
          OR: [
            { userId: currentUserId },
            { recipientId: currentUserId },
            { userId: { in: internalUserIds } },
            { recipientId: { in: internalUserIds } },
          ],
        };
      }

      const notifications = await prisma.notification.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              visibleId: true,
              username: true,
              firstname: true,
              lastname: true,
              department: true,
              role: true,
            },
          },
          recipient: {
            select: {
              visibleId: true,
              username: true,
              firstname: true,
              lastname: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedNotifications = notifications.map((n) => ({
        ...n,
        id: n.visibleId,
        from: n.user ? {
          id: n.user.visibleId,
          username: n.user.username,
          firstname: n.user.firstname,
          lastname: n.user.lastname,
          department: n.user.department,
          role: mapEnumToRole(n.user.role),
        } : null,
      }));

      res.status(200).json({ success: true, notifications: formattedNotifications });
    } catch (error) {
      console.error('Notification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Create notification
  router.post("/notifications", async (req, res) => {
    try {
      const { userId, message, type, reciepient, metadata, goalDetails, objectiveDetails, userDetails, title } = req.body;

      // Get internal user ID from visible ID
      const user = await prisma.user.findUnique({
        where: { visibleId: userId },
        select: { id: true },
      });
      
      let recipientInternalId = null;
      if (reciepient) {
        const recipient = await prisma.user.findUnique({
          where: { visibleId: reciepient },
          select: { id: true },
        });
        recipientInternalId = recipient?.id;
      }

      const notification = await prisma.notification.create({
        data: {
          visibleId: uuidv4(),
          userId: user?.id || userId,
          title,
          message,
          type,
          recipientId: recipientInternalId,
          metadata: metadata || null,
          goalDetails: goalDetails || null,
          objectiveDetails: objectiveDetails || null,
          userDetails: userDetails || null,
        },
      });

      res.status(201).json({ success: true, notification });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Mark notification as read
  router.put("/notifications/:id/read", async (req, res) => {
    try {
      const notification = await prisma.notification.update({
        where: { visibleId: req.params.id },
        data: { isRead: true },
      });

      res.status(200).json({ success: true, notification });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Mark all notifications as read
  router.put("/notifications/mark-all-read", async (req, res) => {
    try {
      const visibleId = req.decoded?.id;
      
      // Get internal user ID
      const user = await prisma.user.findUnique({
        where: { visibleId },
        select: { id: true },
      });
      const userId = user?.id;

      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId },
            { recipientId: userId },
          ],
          isRead: false,
        },
        data: { isRead: true },
      });

      res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Delete notification
  router.delete("/notifications/:id", async (req, res) => {
    try {
      await prisma.notification.delete({
        where: { visibleId: req.params.id },
      });

      res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
};
