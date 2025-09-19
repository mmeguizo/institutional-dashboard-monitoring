const User = require("../models/user"); // Import User Model Schema
const { v4: uuidv4 } = require("uuid");
const hash = require("../config/password-hasher");
const mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
// const { logger } = require("../middleware/logger");
const ObjectId = mongoose.Types.ObjectId;
const Department = require("../models/department");

module.exports = (router) => {
  router.get("/getAllVicePresident", async (req, res) => {
    let data = [];
    try {
      let vicePresident = await User.find({
        role: "vice-president",
        deleted: false,
      });

      if (vicePresident.length > 0) {
        data.push(
          vicePresident.map((e) => {
            return {
              name: e.department.replace(/\b\w/g, (char) => char.toUpperCase()),
              code: e.department,
              id: e.id,
              firstname: e.firstname,
              lastname: e.lastname,
              fullname:
                e.firstname.replace(/\b\w/g, (char) => char.toUpperCase()) +
                " " +
                e.lastname.replace(/\b\w/g, (char) => char.toUpperCase()),
              _id: e._id,
            };
          })
        );
      }
      return res.status(200).json({ success: true, data: data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error });
    }
  });
  router.get("/getAllUsers", async (req, res) => {
    let data = [];
    try {
      let vicePresident = await User.find({
        deleted: false,
      });

      if (vicePresident.length > 0) {
        data.push(
          vicePresident.map((e) => {
            return {
              department: e.department.replace(/\b\w/g, (char) =>
                char.toUpperCase()
              ),
              code: e.department,
              code: e.id,
              firstname: e.firstname,
              lastname: e.lastname,
              name:
                e.firstname.replace(/\b\w/g, (char) => char.toUpperCase()) +
                " " +
                e.lastname.replace(/\b\w/g, (char) => char.toUpperCase()),
              _id: e._id,
            };
          })
        );
      }
      return res.status(200).json({ success: true, data: data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error });
    }
  });

  router.get("/getAllDirector", async (req, res) => {
    let data = [];
    try {
      let directorData = await User.find({
        role: "director",
        deleted: false,
      });
      // Check if directorData has any items
      if (directorData.length > 0) {
        data.push(
          directorData.map((e) => {
            return {
              name: e.department.replace(/\b\w/g, (char) => char.toUpperCase()),
              code: e.department,
              id: e.id,
              firstname: e.firstname,
              lastname: e.lastname,
              fullname:
                e.firstname.replace(/\b\w/g, (char) => char.toUpperCase()) +
                " " +
                e.lastname.replace(/\b\w/g, (char) => char.toUpperCase()),
              _id: e._id,
            };
          })
        );
      }
      return res.status(200).json({ success: true, data: data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error });
    }
  });

  router.get("/getAllUsersForDashboard", async (req, res) => {
    let data = [];
    try {
      let adminCount = await User.countDocuments({
        deleted: false,
        role: "admin",
      });
      let vicePresidentCount = await User.countDocuments({
        deleted: false,
        role: "vice-president",
      });
      let directorCount = await User.countDocuments({
        deleted: false,
        role: "director",
      });
      let officeHeadCount = await User.countDocuments({
        deleted: false,
        role: "office-head",
      });
      let documentCount = await User.countDocuments({ deleted: false });
      data.push({
        admin: adminCount,
        vice_president: vicePresidentCount,
        director: directorCount,
        office_head: officeHeadCount,
        document: documentCount,
      });
      res.json({ success: true, data: data });
    } catch (error) {
      res.json({ success: false, message: error });
    }
  });

  // router.get("/getAllUsers", (req, res) => {
  //   User.find(
  //     { deleted: false },
  //     { id: 1, email: 1, username: 1, department: 1, role: 1, status: 1 },
  //     (err, users) => {
  //       if (err) {
  //         res.json({ success: false, message: err });
  //       } else {
  //         if (!users) {
  //           res.json({ success: false, message: "No User found." });
  //         } else {
  //           res.json({ success: true, users: users });
  //         }
  //       }
  //     }
  //   ).sort({ _id: -1 });
  // });

  router.get("/getAllUsersAdminDepartments", async (req, res) => {
    try {
      const users = await User.find(
        { deleted: false },
        { id: 1, email: 1, username: 1, department: 1, role: 1, status: 1 }
      ).sort({ _id: -1 });

      if (!users || users.length === 0) {
        return res.json({ success: false, message: "No User found." });
      }

      // Format data for PrimeNG dropdown
      const formattedUsers = users.map((user) => ({
        name: user.username || user.email, // Use username or fallback to email
        code: user.id, // Use id as the code
        // Include additional data that may be needed
        email: user.email,
        department: user.department,
        role: user.role,
        status: user.status,
      }));

      return res.json({
        success: true,
        users: formattedUsers,
      });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  });

  router.get("/getAllUsersExceptLoggedIn/:id", (req, res) => {
    User.find(
      { id: { $ne: req.params.id }, deleted: false },
      // {
      //   id: 1,
      //   email: 1,
      //   username: 1,
      //   department: 1,
      //   role: 1,
      //   status: 1,
      //   campus: 1,
      // },
      (err, users) => {
        if (err) {
          res.json({ success: false, message: err });
        } else {
          if (!users) {
            res.json({ success: false, message: "No User found." });
          } else {
            res.json({ success: true, users: users });
          }
        }
      }
    ).sort({ _id: -1 });
  });

  router.post("/findById", (req, res) => {
    User.findOne({ id: req.body.id }, function (err, user) {
      if (err) {
        res.json({ success: false, message: err });
      } else {
        if (!user) {
          res.json({ success: false, message: "No User found." });
        } else {
          res.json({ success: true, user: user });
        }
      }
    });
  });

  router.post("/addUser", async (req, res) => {
    try {
      const {
        email,
        username,
        password,
        confirm,
        department,
        role,
        firstname,
        lastname,
        campus,
        department_id,
        vice_president_name,
        vice_president_id,
        director_name,
        director_id,
      } = req.body;

      // Required field checks
      if (!email || !username || !password || !firstname || !lastname || !role) {
        return res.json({
          success: false,
          message: "Missing required fields.",
          err: "Missing required fields."
        });
      }

      const rawPwd = password.trim();
      if (rawPwd.length < 8 || rawPwd.length > 35) {
        return res.json({
          success: false,
          message: "Password must be 8-35 characters.",
            err: "Password must be 8-35 characters."
        });
      }

      if (password !== confirm) {
        return res.json({
          success: false,
          message: "Password confirmation does not match.",
          err: "Password confirmation does not match."
        });
      }

      const normalizedRole =
        role.toLowerCase() === "president" ? "admin" : role.toLowerCase();

      const deptInputTrimmed = (department || "").trim();

      const createdUser = await User.create({
        id: uuidv4(),
        firstname: firstname.toLowerCase(),
        lastname: lastname.toLowerCase(),
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: await hash.encryptPassword(rawPwd),
        department: deptInputTrimmed,
        department_id: department_id || "",
        vice_president_name: (vice_president_name || "").trim(),
        vice_president_id: (vice_president_id || "").trim(),
        director_name: (director_name || "").trim(),
        director_id: (director_id || "").trim(),
        campus,
        role: normalizedRole
      });

      let departmentUpdated = false;

      if (deptInputTrimmed) {
        if (department_id && department_id.trim() !== "") {
          // Explicit department id supplied: update that department as head
          try {
            const updatedDept = await Department.findOneAndUpdate(
              { id: department_id },
              {
                $set: {
                  department: deptInputTrimmed,
                  department_head: createdUser.username,
                  user_id: createdUser.id,
                  campus
                }
              },
              { new: true }
            );
            if (updatedDept) {
              departmentUpdated = true;
            }
          } catch (e) {
            console.error("Department (by id) update failed:", e.message);
          }
        } else {
          // No department_id: find by name (case-insensitive) or create
          const existingDepartment = await Department.findOne({
            department: {
              $regex: new RegExp(
                `^${deptInputTrimmed.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}$`,
                "i"
              )
            }
          });

            if (!existingDepartment) {
              try {
                const newDept = await Department.create({
                  id: uuidv4(),
                  department: deptInputTrimmed,
                  department_head: createdUser.username,
                  user_id: createdUser.id,
                  campus
                });
                await User.updateOne(
                  { _id: createdUser._id },
                  { department_id: newDept.id }
                );
                departmentUpdated = true;
              } catch (depErr) {
                console.error("Department create failed:", depErr.message);
              }
            } else {
              // Attach id if user had none
              if (!createdUser.department_id) {
                await User.updateOne(
                  { _id: createdUser._id },
                  { department_id: existingDepartment.id }
                );
              }
              // Assign head if vacant
              if (!existingDepartment.department_head) {
                await Department.updateOne(
                  { _id: existingDepartment._id },
                  {
                    $set: {
                      department_head: createdUser.username,
                      user_id: createdUser.id
                    }
                  }
                );
                departmentUpdated = true;
              }
            }
        }
      }

      return res.json({
        success: true,
        message: departmentUpdated
          ? "User successfully registered and department updated."
          : "User successfully registered.",
        data: {
          id: createdUser.id,
          email,
          firstname,
          lastname,
          username,
          department: deptInputTrimmed,
          role: normalizedRole
        }
      });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.json({
          success: false,
          message: "Username or email already exists.",
          err: "Username or email already exists."
        });
      }

      if (err.name === "ValidationError") {
        const firstErr =
          Object.values(err.errors || {})[0]?.message || "Validation failed.";
        return res.json({
          success: false,
          message: firstErr,
          err: firstErr
        });
      }

      console.error("addUser error:", err);
      return res.json({
        success: false,
        message: "Could not save user. Error: " + err.message,
        err: "Could not save user. Error: " + err.message
      });
    }
  });

  router.put("/deleteUser", (req, res) => {
    let data = req.body;

    User.deleteOne(
      {
        id: data.id,
      },
      (err, user) => {
        if (err) {
          res.json({ success: false, message: "Could not Delete User" + err });
        } else {
          res.json({
            success: true,
            message: " Successfully Deleted the User",
            data: user,
          });
          // globalconnetion.emitter('user')
        }
      }
    );
  });

  router.put("/setInactiveUser", (req, res) => {
    let data = req.body;

    User.findOne(
      {
        id: data.id,
      },
      (err, user) => {
        if (err) throw err;
        User.findOneAndUpdate(
          { id: data.id },
          {
            deleted: true,
            status: user.status === "active" ? "inactive" : "inactive",
          },
          { upsert: true },
          (err, response) => {
            if (err) return res.json({ success: false, message: err.message });
            if (response) {
              res.json({
                success: true,
                message: " Successfully Delete User",
                data: user,
              });
            } else {
              res.json({ success: false, message: "Could Delete User" + err });
            }
          }
        );
      }
    );
  });

  router.put("/changeUserStatus", (req, res) => {
    let { id } = req.body;
    User.findOne(
      {
        id: id,
      },
      (err, user) => {
        let statusData =
          user.status === "pending"
            ? "active"
            : user.status === "active"
            ? "inactive"
            : "active";

        if (err) throw err;
        User.findOneAndUpdate(
          { id: id },
          { status: statusData },
          { upsert: true },
          (err, response) => {
            if (err) return res.json({ success: false, message: err.message });
            if (!response) {
              res.json({
                success: false,
                message: "Could not set User  Status" + err,
              });
            } else {
              res.json({
                success: true,
                message: " Successfully User set Status",
                data: user,
              });
            }
          }
        );
      }
    );
  });

  router.put("/updateUser", async (req, res) => {
    let data = req.body;
    let saveData = {};
    let userData = {};
    try {
      const user = await User.findOne({ id: req.body.id });

      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      if (data.confirm !== data.password) {
        return res.json({
          success: false,
          message: "Passwords do not match",
        });
      }

      if (data.password && data.password.trim() !== "") {
        const checkPassword = await bcrypt.compare(
          data.old_password,
          user.password
        );
        if (!checkPassword) {
          return res.json({
            success: false,
            message: "Incorrect old password",
          });
        }

        const hashedPassword = await hash.encryptPassword(data.password);
        saveData.password = hashedPassword;
      }
      if (req.body.role === "president") {
        req.body.role = "admin";
      }

      let requestBody = { role, ...restData } = req.body

      const response = await User.findOneAndUpdate(
        { id: data.id },
        { userData, ...req.body },
        {
          new: true,
        }
      );

      if (response) {
        res.json({
          success: true,
          message: "User information has been updated!",
          data: response,
        });
      } else {
        res.json({
          success: true,
          message: "No user has been modified!",
        });
      }
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });
  router.put("/updateUserAdmin", async (req, res) => {
    let data = req.body;
    let saveData = {};
    let userData = {};

    console.log({ updateUserAdmin: data });

    try {
      const user = await User.findOne({ id: req.body.id });
      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      if (data.password && data.confirm && data.password.trim() !== "") {
        if (data.password !== data.confirm) {
          return res.json({
            success: false,
            message: "Passwords do not match",
          });
        }
        const hashedPassword = await hash.encryptPassword(data.password);
        data.password = hashedPassword;
      }
      
      if(req.body.role === 'president'){
        req.body.role = 'admin'
      }

      const response = await User.findOneAndUpdate(
        { id: data.id },
        { userData, ...req.body },
        {
          new: true,
        }
      );

      if (response) {
        const results = await Department.findOneAndUpdate(
          { id: data.department_id },
          { $set: { department_head: data.username, user_id: data.id } },
          { new: true, upsert: true }
        );

        console.log("Department update results:", results);

        res.json({
          success: true,
          message: "User information has been updated!",
          data: response,
        });
      } else {
        res.json({
          success: true,
          message: "No user has been modified!",
        });
      }
    } catch (err) {
      res.json({ success: false, message: err.message });
    }

    // const checkPassword = await bcrypt.compare(
    //   data.old_password,
    //   user.password
    // );
    // if (!checkPassword) {
    //   return res.json({
    //     success: false,
    //     message: "Incorrect old password",
    //   });
    // }
  });

  router.put("/updateProfile", async (req, res) => {
    let data = req.body;
    let userData = {};

    const user = await User.findOne({ id: req.body.id });

    if (data.confirmPassword !== data.password) {
      res.json({
        success: false,
        message:
          "Password not match : " + data.password + " for " + data.username,
      });
    } else if (data.confirmPassword && data.confirmPassword.trim() !== "") {
      let checkPassword = await bcrypt.compare(
        data.old_password,
        user.password
      );
      if (!checkPassword) {
        res.json({
          success: false,
          message:
            "Incorrect Old Password : " +
            data.password +
            " for " +
            data.username,
        });
      } else {
        hash
          .encryptPassword(data.password)
          .then((hash) => {
            userData.role = data.role;
            userData.firstname = data.firstname;
            userData.lastname = data.lastname;
            userData.username = data.username;
            userData.email = data.email;
            userData.password = hash;
            userData.profile_pic = data.profile_pic;
            User.findOneAndUpdate(
              { id: data.id },
              userData,
              { upsert: true },
              (err, response) => {
                if (err)
                  return res.json({ success: false, message: err.message });
                if (response) {
                  res.json({
                    success: true,
                    message: "User Information has been updated!",
                    data: response,
                  });
                } else {
                  res.json({
                    success: true,
                    message: "No User has been modified!",
                    data: response,
                  });
                }
              }
            );
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      const { username, email, profile_pic, firstname, lastname, id } =
        req.body;

      User.findOneAndUpdate(
        { id: id },
        { username, email, profile_pic, firstname, lastname },
        { upsert: false },
        (err, response) => {
          if (err) return res.json({ success: false, message: err.message });
          if (response) {
            res.json({
              success: true,
              message: "User Information has been updated!",
              data: response,
            });
          } else {
            res.json({
              success: true,
              message: "No User has been modified!",
              data: response,
            });
          }
        }
      );
    }
  });

  router.get("/profile/:id", (req, res) => {
    User.findOne({ id: req.params.id })
      .select("firstname lastname username email profile_pic")
      .exec((err, user) => {
        if (err) {
          res.json({ success: false, message: err.message });
        } else {
          if (!user) {
            res.json({ success: false, message: "User not found" });
          } else {
            res.json({ success: true, user: user });
          }
        }
      });
  });

  router.get("/UserProfilePic/:id", (req, res) => {
    User.findOne({ profile_pic: req.params.id })
      .select("profile_pic")
      .exec((err, user) => {
        if (err) {
          res.json({ success: false, message: err.message });
        } else {
          if (!user) {
            res.json({ success: false, message: "UserPic not found" });
          } else {
            res.json({ success: true, picture: user });
          }
        }
      });
  });

  return router;
};
