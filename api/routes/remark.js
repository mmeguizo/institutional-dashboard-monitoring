require("dotenv").config();
const Remarks = require("../models/remarks");
const Notifications = require("../models/notifications");
const Objectives = require("../models/objective");
const Goal = require("../models/goals");
const Users = require("../models/user");
const chatHistories = new Map();
module.exports = (router) => {
  router.get("/remarks/:objectiveId", async (req, res) => {
    try {
      const remarks = await Remarks.aggregate([
        {
          $match: {
            objectiveId: req.params.objectiveId,
            deleted: false,
          },
        },
        {
          $lookup: {
            as: "users",
            from: "users",
            foreignField: "id",
            localField: "userId",
          },
        },
        {
          $unwind: {
            path: "$users",
          },
        },
        {
          $project: {
            remarks: 1,
            "users.firstname": 1,
            "users.lastname": 1,
            createdAt: 1,
            userId: 1,
            objectiveId: 1,
            _id: 1,
          },
        },
      ]).sort({ createdAt: -1 });
      res.status(200).json(remarks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/remarks", async (req, res) => {
    try {
    //   console.log(req.decoded);
    //   console.log("=======================");
      const userDecoded = req.decoded;
      const newRemark = new Remarks(req.body);
      const savedRemark = await newRemark.save();
      const objective = await Objectives.find({ id: savedRemark.objectiveId });
      const userDetails = await Users.find({ id: req.body.userId });
      const president = await Users.find({ role: "admin" });
      const goalDetails = await Goal.find({ id: objective[0].goalId });
    //   console.log(objective);
    //   console.log("=======================");
      let reciepientData = "";

      if (req.decoded.role && req.decoded.role === "office-head") {
        //  reciepientData = objective[0].userId;
        //  if( userDecoded.director_id === )
        reciepientData = userDecoded.director_id;
      } else if (req.decoded.role && req.decoded.role === "director") {
        //reciepient
        reciepientData = objective[0].userId;
        if (userDecoded.id === objective[0].userId) {
          reciepientData = userDecoded.vice_president_id;
        } 
        
      } else if (req.decoded.role && req.decoded.role === "vice-president") {
        reciepientData = objective[0].userId;

        if (userDecoded.id === objective[0].userId) {
          reciepientData = president[0].id;
        } 


        // if (userDecoded.role === objective[0].userId) {
        //   reciepientData = president.id;
        // } else {
        //   //notify upper leader
        //   await Notifications.create({
        //     userId: req.decoded.id,
        //     message: `New remark added to objective`,
        //     type: "remark_added",
        //     createdAt: new Date(),
        //     reciepient: president.id,
        //     metadata: savedRemark,
        //     goalDetails: goalDetails[0],
        //     objectiveDetails: objective[0],
        //     userDetails: userDecoded,
        //   });
        // }
        //notify upper leader
        // await Notifications.create({
        //   userId: req.decoded.id,
        //   message: `New remark added to objective`,
        //   type: "remark_added",
        //   createdAt: new Date(),
        //   reciepient: president.id,
        //   metadata: savedRemark,
        //   goalDetails: goalDetails[0],
        //   objectiveDetails: objective[0],
        //   userDetails: userDecoded,
        // });

        // reciepientData = president[0].id;
      }else {
       reciepientData = objective[0].userId;
      }

    //   console.log(reciepientData);
    //   console.log("=======================");

      await Notifications.create({
        userId: req.decoded.id,
        message: `New remark added to objective`,
        type: "remark_added",
        createdAt: new Date(),
        reciepient: reciepientData || "",
        metadata: savedRemark,
        goalDetails: goalDetails[0],
        objectiveDetails: objective[0],
        userDetails: userDecoded,
      });

      //   if (req.decoded.role === "office-head") {
      //     await Notifications.create({
      //       userId: req.decoded.id,
      //       message: `New remark added to objective`,
      //       type: "remark_added",
      //       createdAt: new Date(),
      //       reciepient: userDetails[0].vice_president_id,
      //       metadata: savedRemark,
      //       goalDetails: goalDetails[0],
      //       objectiveDetails: objective[0],
      //       userDetails: userDetails[0],
      //     });
      //   }

      //   if (req.decoded.role === "director") {
      //     await Notifications.create({
      //       userId: req.decoded.id,
      //       message: `New remark added to objective`,
      //       type: "remark_added",
      //       createdAt: new Date(),
      //       reciepient: userDetails[0].vice_president_id,
      //       metadata: savedRemark,
      //       goalDetails: goalDetails[0],
      //       objectiveDetails: objective[0],
      //       userDetails: userDetails[0],
      //     });
      //   }

      //   if (req.decoded.role === "vice-president") {
      //     await Notifications.create({
      //       userId: req.decoded.id,
      //       message: `New remark added to objective`,
      //       type: "remark_added",
      //       createdAt: new Date(),
      //       reciepient: president[0].id,
      //       metadata: savedRemark,
      //       goalDetails: goalDetails[0],
      //       objectiveDetails: objective[0],
      //       userDetails: userDetails[0],
      //     });
      //   }

      res.status(201).json(userDetails);
      //   res.status(201).json(savedRemark);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put("/remarks/:id", async (req, res) => {
    try {
      const updatedRemark = await Remarks.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      await Notifications.create({
        userId: req.decoded.id,
        message: `Remark updated`,
        type: "remark_updated",
        createdAt: new Date(),
        metadata: updatedRemark,
      });
      res.status(200).json(updatedRemark);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/remarks/:id", async (req, res) => {
    try {
      await Remarks.findByIdAndDelete(req.params.id);
      // Add notification for deleted remark
      await Notifications.create({
        userId: req.decoded.id,
        message: `Remark deleted`,
        type: "remark_deleted",
        createdAt: new Date(),
        metadata: deletedRemark,
      });

      res.status(200).json({ message: "Remark deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
