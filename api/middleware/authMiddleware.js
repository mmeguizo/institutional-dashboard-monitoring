const jwt = require("jsonwebtoken");
const config = require("../config/database");

/**
 * JWT Authentication Middleware
 * Verifies the token and sets req.decoded with user data
 */
const verifyToken = (req, res, next) => {
  let token = "";

  if (req.headers["authorization"]) {
    // Extract the token by removing the 'Bearer ' part
    token = req.headers["authorization"].substring(
      req.headers["authorization"].indexOf(" ") + 1
    );
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  // Decrypt and verify the token
  jwt.verify(token, config.secret, (err, decoded) => {
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
          message: "Internal server error during authentication.",
        });
      }
    } else {
      // Assign the decoded token to request object
      req.decoded = decoded;
      next(); // Proceed to the next middleware or route handler
    }
  });
};

module.exports = verifyToken;
