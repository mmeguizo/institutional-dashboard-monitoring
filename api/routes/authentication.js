const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const config = require("../config/database");
const { v4: uuidv4 } = require("uuid");
let bcrypt = require("bcryptjs");

// Helper function to compare passwords
const comparePassword = async (inputPassword, hashedPassword) => {
  return bcrypt.compare(inputPassword, hashedPassword);
};

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
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

// Map enum to role string (for JWT)
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
  router.post("/register", async (req, res) => {
    try {
      const { email, username, password, confirm, firstname, lastname, campus } = req.body;
      if (!email)
        return res.json({ success: false, message: "You must provide an email" });
      if (!username)
        return res.json({
          success: false,
          message: "You must provide an username",
        });
      if (!password)
        return res.json({ success: false, message: "Provide a Password" });
      if (!confirm)
        return res.json({
          success: false,
          message: "Provide a Matching Password",
        });
      if (password !== confirm)
        return res.json({ success: false, message: "Password not match" });

      // Validate password length
      if (password.length < 8 || password.length > 35) {
        return res.json({ success: false, message: "Password must be 8-35 characters" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          visibleId: uuidv4(),
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          password: hashedPassword,
          firstname: firstname || '',
          lastname: lastname || '',
          campus: campus || 'Talisay',
          role: 'OFFICE_HEAD',
        },
        select: {
          email: true,
          username: true,
        }
      });

      res.json({
        success: true,
        message: "Account Registered successfully",
        data: user,
      });
    } catch (err) {
      // Handle unique constraint violations
      if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        return res.json({
          success: false,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
          err: err.message,
        });
      }
      res.json({
        success: false,
        message: "Could not save user Error",
        err: err.message,
      });
    }
  });

  router.get("/checkEmail/:email", async (req, res) => {
    try {
      if (!req.params.email) {
        return res.json({ success: false, message: "Email not provided" });
      }
      
      const email = await prisma.user.findUnique({ 
        where: { email: req.params.email.toLowerCase() }
      });
      if (email) {
        return res.json({ success: false, message: "Email already taken" });
      }
      res.json({ success: true, message: "Email available" });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  router.get("/checkUsername/:username", async (req, res) => {
    try {
      if (!req.params.username) {
        return res.json({ success: false, message: "Username not provided" });
      }
      
      const username = await prisma.user.findUnique({ 
        where: { username: req.params.username.toLowerCase() }
      });
      if (username) {
        return res.json({ success: false, message: "Username already taken" });
      }
      res.json({ success: true, message: "Username available" });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  // Login route using Prisma
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email)
        return res.json({ success: false, message: "No email was provided" });
      if (!password)
        return res.json({ success: false, message: "No password was provided" });

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (!user)
        return res.json({ success: false, message: "User Not Found" });
      if (user.status === "pending")
        return res.json({ success: false, message: "Account Still Pending" });
      if (user.status === "inactive")
        return res.json({
          success: false,
          message: "Your account is inactive",
        });

      const isPasswordValid = await comparePassword(password.trim(), user.password);
      
      if (isPasswordValid) {
        // Create user object for JWT (exclude sensitive data)
        const userForToken = {
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
        };

        const token = jwt.sign(userForToken, config.secret, {
          expiresIn: "24h",
        });

        res.json({
          success: true,
          message: "Password is Correct",
          token: token,
        });
      } else {
        res.json({
          success: false,
          message: "Password is incorrect",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      res.json({
        success: false,
        message: "Unable to connect to the server. Please try again later.",
      });
    }
  });

  /*
o = {a: 5, b: 6, c: 7}
Object.fromEntries(Object.entries(o).filter(e => e[0] != 'b'))
Object { a: 5, c: 7 }

*/

  // any route that needs authorization or token should be under it if not above this middleware
  router.use((req, res, next) => {
    //'@auth0/angular-jwt' automatically adds token in the headers but it also adds the word 'Bearer ', so we manually format it.
    let token = "";
    let request = req;
    const startTime = Date.now();
    const duration = Date.now() - startTime;

    const data = {
      method: req?.method,
      params: req?.params,
      query: req?.query,
      url: req?.originalUrl,
      body: req?.body,
      status: res.statusCode,
      duration: `${duration}ms`,
      date: Date.now(),
    };

    if (req.headers["authorization"]) {
      // Extract the token by removing the 'Bearer ' part
      // token = req.headers["authorization"].split(" ")[1];
      token = req.headers["authorization"].substring(
        req.headers["authorization"].indexOf(" ") + 1
      );
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided authentication" });
    } else {
      // Decrypt and verify the token
      jwt.verify(token, config.secret, (err, decoded) => {
        if (decoded) {
          data.user = { username, id, role, profile_pic, campus, department } =
            decoded;
          // logMiddleware(data);
        }

        if (err) {
          // Handle expired or invalid token
          if (err.name === "TokenExpiredError") {
            return res.status(401).json({
              success: false,
              message: "Token has expired. Please log in again.",
            });
          } else if (err.name === "JsonWebTokenError") {
            return res.status(400).json({
              success: false,
              message: "Token is invalid: " + err.message,
            });
          } else {
            return res.status(500).json({
              success: false,
              message: "Internal server error Or Token Expired Auth.",
            });
          }
        } else {
          // Assign the decoded token to request headers
          req.decoded = decoded;
          next(); // Proceed to the next middleware or route handler
        }
      });
    }
  });

  return router;
};
