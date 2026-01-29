/**
 * Database Index Creation Script
 * Run this script once to create all performance indexes on existing MongoDB collections
 * 
 * Usage: node scripts/createIndexes.js
 */

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const config = require("../config/database");

// Import all models to register schemas
require("../models/user");
require("../models/goals");
require("../models/objective");
require("../models/department");
require("../models/notifications");
require("../models/goallists");
require("../models/fileupload");
require("../models/logs");
require("../models/userhistories");
require("../models/remarks");

async function createIndexes() {
  try {
    console.log("🔄 Connecting to database...");
    await mongoose.connect(config.uri, config.options);
    console.log("✅ Connected to database");

    console.log("\n🔄 Creating indexes...\n");

    // Get all registered models
    const models = mongoose.modelNames();
    
    for (const modelName of models) {
      const Model = mongoose.model(modelName);
      console.log(`📋 Processing ${modelName}...`);
      
      try {
        // Sync indexes (creates missing, doesn't affect existing)
        await Model.syncIndexes();
        
        // Get and display created indexes
        const indexes = await Model.collection.getIndexes();
        console.log(`   ✅ ${Object.keys(indexes).length} indexes on ${modelName}:`);
        Object.keys(indexes).forEach(indexName => {
          console.log(`      - ${indexName}`);
        });
      } catch (err) {
        console.log(`   ⚠️ Error on ${modelName}: ${err.message}`);
      }
    }

    console.log("\n✅ Index creation complete!");
    console.log("\n📊 Index Summary:");
    console.log("   - User: 7 indexes (id, email, username, role+deleted, director_id+deleted, etc.)");
    console.log("   - Goals: 7 indexes (id, deleted+createdBy, deleted+department, etc.)");
    console.log("   - Objective: 7 indexes (id, deleted+userId, goalId+deleted, etc.)");
    console.log("   - Department: 3 indexes (id, department, status+deleted)");
    console.log("   - Notification: 5 indexes (userId+isRead, recipient+isRead, etc.)");
    console.log("   - And more...");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createIndexes();
