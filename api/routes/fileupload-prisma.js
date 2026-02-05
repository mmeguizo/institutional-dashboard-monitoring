/**
 * FileUpload Routes - Prisma/MySQL Version
 * Migrated from MongoDB/Mongoose
 */
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const md5 = require("md5");

module.exports = (router) => {
  // Add multiple files
  router.post(
    "/addMultipleFiles/:user_id/:objective_id/:uploadObjectiveFilemonth",
    async (req, res) => {
      const useFor = "files";
      const form = new formidable.IncomingForm({ multiples: true });
      form.maxFileSize = 2500 * 1024 * 1024;
      form.uploadDir = path.join(__dirname, "..", "images/files");

      form.on("file", async (field, file) => {
        const newFileName = [useFor, Math.random(), Math.random(), Math.random()].join("");
        const ext = file.originalFilename?.split(".").pop();
        const finalFileName = `${md5(newFileName)}${ext ? `.${ext}` : ""}`;

        try {
          const filePath = file.filepath;
          const readStream = fs.createReadStream(filePath);

          await new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(
              path.join(form.uploadDir, finalFileName)
            );
            fileStream.on("error", (err) => reject(err));
            fileStream.on("finish", () => resolve());
            readStream.pipe(fileStream);
          });

          const fileData = {
            visibleId: uuidv4(),
            userId: req.params.user_id,
            objectiveId: req.params.objective_id,
            source: finalFileName,
            forField: "files",
            filetype: file.mimetype?.split("/")[0] || "unknown",
          };

          // Add the frequency file name field
          if (req.params.uploadObjectiveFilemonth) {
            fileData[req.params.uploadObjectiveFilemonth] = finalFileName;
          }

          await prisma.fileUpload.create({
            data: fileData,
          });

          res.json({
            success: true,
            message: "Files uploaded successfully!",
            fileNames: [finalFileName],
          });
        } catch (err) {
          console.error("Error uploading file:", err);
          res.status(500).json({ success: false, message: err.message });
        }
      });

      form.on("error", (err) => {
        console.error("An error occurred:", err);
        res.status(500).json({ success: false, message: err.message });
      });

      form.parse(req);
    }
  );

  // Add objective files
  router.post("/addObjectiveFiles/:user_id/", async (req, res) => {
    const useFor = "files";
    const form = new formidable.IncomingForm({ multiples: true });
    form.maxFileSize = 2500 * 1024 * 1024;
    form.uploadDir = path.join(__dirname, "..", "images/files");

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error parsing form" });
      }

      const objectiveId = fields.objectiveId;
      const frequencyFileName = fields.frequencyFileName;
      const uploadedFileNames = [];

      const fileArray = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);

      for (const file of fileArray) {
        const newFileName = [useFor, Math.random(), Math.random(), Math.random()].join("");
        const ext = file.originalFilename?.split(".").pop();
        const finalFileName = `${md5(newFileName)}${ext ? `.${ext}` : ""}`;

        try {
          const filePath = file.filepath;
          const readStream = fs.createReadStream(filePath);

          await new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(
              path.join(form.uploadDir, finalFileName)
            );
            fileStream.on("error", (err) => reject(err));
            fileStream.on("finish", () => resolve());
            readStream.pipe(fileStream);
          });

          const fileData = {
            visibleId: uuidv4(),
            userId: req.params.user_id,
            objectiveId: objectiveId?.[0] || objectiveId,
            source: finalFileName,
            forField: "files",
            filetype: file.mimetype?.split("/")[0] || "unknown",
          };

          await prisma.fileUpload.create({
            data: fileData,
          });

          uploadedFileNames.push(finalFileName);
        } catch (uploadErr) {
          console.error("Error uploading file:", uploadErr);
        }
      }

      res.json({
        success: true,
        message: "Files uploaded successfully!",
        fileNames: uploadedFileNames,
      });
    });
  });

  // Get files by objective ID
  router.get("/getFilesByObjective/:objective_id", async (req, res) => {
    try {
      const files = await prisma.fileUpload.findMany({
        where: {
          objectiveId: req.params.objective_id,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedFiles = files.map((f) => ({
        _id: f.id,
        id: f.visibleId,
        user_id: f.userId,
        objective_id: f.objectiveId,
        source: f.source,
        for: f.forField,
        filetype: f.filetype,
        status: f.status,
        createdAt: f.createdAt,
      }));

      res.json({ success: true, files: formattedFiles });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Get files by user ID
  router.get("/getFilesByUser/:user_id", async (req, res) => {
    try {
      const files = await prisma.fileUpload.findMany({
        where: {
          userId: req.params.user_id,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedFiles = files.map((f) => ({
        _id: f.id,
        id: f.visibleId,
        user_id: f.userId,
        objective_id: f.objectiveId,
        source: f.source,
        for: f.forField,
        filetype: f.filetype,
        status: f.status,
        createdAt: f.createdAt,
      }));

      res.json({ success: true, files: formattedFiles });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Delete file (soft delete)
  router.delete("/deleteFile/:id", async (req, res) => {
    try {
      await prisma.fileUpload.update({
        where: { visibleId: req.params.id },
        data: { status: false },
      });

      res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Delete file by objective
  router.put("/deleteFileObjective", async (req, res) => {
    try {
      const { objective_id, source } = req.body;

      await prisma.fileUpload.updateMany({
        where: {
          objectiveId: objective_id,
          source: source,
        },
        data: { status: false },
      });

      res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

  // Profile picture upload
  router.post("/uploadProfilePic/:user_id", async (req, res) => {
    const useFor = "profile";
    const form = new formidable.IncomingForm({ multiples: false });
    form.maxFileSize = 10 * 1024 * 1024; // 10MB limit for profile pics
    form.uploadDir = path.join(__dirname, "..", "uploads/images");

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error parsing form" });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ success: false, message: "No file provided" });
      }

      const newFileName = [useFor, Math.random(), Math.random()].join("");
      const ext = file.originalFilename?.split(".").pop();
      const finalFileName = `${md5(newFileName)}${ext ? `.${ext}` : ""}`;

      try {
        const filePath = file.filepath;
        const readStream = fs.createReadStream(filePath);

        await new Promise((resolve, reject) => {
          const fileStream = fs.createWriteStream(
            path.join(form.uploadDir, finalFileName)
          );
          fileStream.on("error", (err) => reject(err));
          fileStream.on("finish", () => resolve());
          readStream.pipe(fileStream);
        });

        // Update user profile pic
        await prisma.user.update({
          where: { visibleId: req.params.user_id },
          data: { profilePic: finalFileName },
        });

        res.json({
          success: true,
          message: "Profile picture uploaded successfully",
          fileName: finalFileName,
        });
      } catch (uploadErr) {
        res.status(500).json({ success: false, message: uploadErr.message });
      }
    });
  });

  // Add avatar (for profile pictures in images folder)
  router.post("/addAvatar", (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "..", "images");
    form.maxFileSize = 10 * 1024 * 1024; // 10MB limit

    form.on("file", async (field, file) => {
      const newFileName = ["avatar", Math.random(), Math.random(), Math.random()].join("");
      const ext = file.originalFilename?.split(".").pop();
      const finalFileName = `${md5(newFileName)}${ext ? `.${ext}` : ""}`;

      try {
        if (fs.existsSync(file.filepath)) {
          fs.rename(
            file.filepath,
            path.join(form.uploadDir, finalFileName),
            async (err) => {
              if (err) {
                return res.json({
                  success: false,
                  message: err.name + " " + err.message,
                });
              }

              // Create file record
              const fileRecord = await prisma.fileUpload.create({
                data: {
                  visibleId: uuidv4(),
                  source: finalFileName,
                  userId: req.decoded?.id || "",
                  forField: "avatar",
                  objectiveId: "dummy_id",
                  filetype: file.mimetype?.substring(0, file.mimetype.indexOf("/")) || "image",
                },
              });

              res.json({
                success: true,
                message: "Avatar uploaded successfully",
                data: {
                  id: fileRecord.visibleId,
                  source: fileRecord.source,
                  for: fileRecord.forField,
                  filetype: fileRecord.filetype,
                },
              });
            }
          );
        } else {
          return res.json({
            success: false,
            message: "Something went wrong please re-upload your image.",
          });
        }
      } catch (uploadErr) {
        res.json({ success: false, message: uploadErr.message });
      }
    });

    form.on("error", (err) => {
      console.log("An error has occurred: " + err);
      res.json({ success: false, message: err.message });
    });

    form.on("end", () => {
      console.log("Avatar upload form parsing ended");
    });

    form.parse(req);
  });

  return router;
};
