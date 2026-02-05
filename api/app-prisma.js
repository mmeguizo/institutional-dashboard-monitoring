require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const app = express();
const PORT = process.env.PORT || 3002;
const path = require("path");
const { initRedis } = require("./utils/cache");
const http = require("http").Server(app);

// Import Prisma client for database connection
const prisma = require("./config/prisma");

// Initialize Redis cache (only if REDIS_ENABLED=true in .env)
initRedis();

// ====================
// PRISMA ROUTES (MySQL)
// Each route file gets its own router to avoid conflicts
// ====================
const authentication = require("./routes/authentication")(express.Router());
const users = require("./routes/users-prisma")(express.Router());
const file = require("./routes/fileupload-prisma")(express.Router());
const department = require("./routes/department-prisma")(express.Router());
const goals = require("./routes/goals-prisma")(express.Router());
const objectives = require("./routes/objectives-prisma")(express.Router());
const campus = require("./routes/campus-prisma")(express.Router());
const log = require("./routes/log-prisma")(express.Router());
const userhistory = require("./routes/userhistory-prisma")(express.Router());
const ai = require("./routes/ai")(express.Router());
const goallists = require("./routes/goallists-prisma")(express.Router());
const remarks = require("./routes/remark-prisma")(express.Router());
const notifications = require("./routes/notification-prisma")(express.Router());

// Role-based query routes
const {
  directorRoutes,
  vicePresidentRoutes,
  officeHeadRoutes,
  sharedFileRoutes,
} = require("./routes/role-query-prisma");

const director_query = directorRoutes(express.Router());
const vice_president_query = vicePresidentRoutes(express.Router());
const office_head_query = officeHeadRoutes(express.Router());
const shared_files = sharedFileRoutes(express.Router());

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to MySQL database: " + process.env.DB_NAME || "idm");
    console.log("   Running on " + process.env.NODE_ENV + " mode");
    console.log("   Port: " + PORT);
  } catch (error) {
    console.error("❌ Failed to connect to MySQL database:", error.message);
    process.exit(1);
  }
}

testDatabaseConnection();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false,
  })
);

// Compression for response bodies
app.use(compression());

// Rate limiting - protect against DDoS and brute force attacks
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.use("/authentication", authLimiter);

app.use(cors());

//CORS middleware
var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};

//body-parser built in express middleware
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: false }));

app.use(allowCrossDomain);

//for deployment on hosting and build
app.use(express.static(__dirname + "/dist/"));
app.use("/images", express.static(path.join(__dirname, "./images")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads/files")));

// ====================
// API ROUTES
// ====================
app.use("/authentication", authentication);
app.use("/users", users);
app.use("/fileupload", file);
app.use("/department", department);
app.use("/objectives", objectives);
app.use("/goals", goals);
app.use("/campus", campus);
app.use("/logs", log);
app.use("/ai", ai);
app.use("/userhistory", userhistory);
app.use("/goallists", goallists);
app.use("/director_query", director_query);
app.use("/office_head_query", office_head_query);
app.use("/vice_president_query", vice_president_query);
app.use("/shared", shared_files);
app.use("/remark", remarks);
app.use("/notification", notifications);
app.use(
  "/profile_pic",
  express.static(path.join(__dirname, "../uploads/images"))
);

// SPA catch-all route (only works when dist folder exists)
const fs = require("fs");
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "dist", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // During development, just return 404 for undefined routes
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  }
});

const servers = app.listen(PORT, () => {
  console.log("Connected on port " + PORT);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  servers.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  servers.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Memory monitoring
setInterval(() => {
  const m = process.memoryUsage();
  const heapUsedMB = (m.heapUsed / 1024 / 1024).toFixed(2);
  const heapTotalMB = (m.heapTotal / 1024 / 1024).toFixed(2);
  console.log(
    `DIAG MEM heapUsed=${heapUsedMB}MB heapTotal=${heapTotalMB}MB rss=${(
      m.rss /
      1024 /
      1024
    ).toFixed(2)}MB uptime=${process.uptime().toFixed(0)}s`
  );
}, 5 * 60 * 1000);
