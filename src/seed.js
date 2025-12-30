require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Task = require("./models/Task");

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI missing in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ⚠️ Clean old data
    await Promise.all([User.deleteMany({}), Task.deleteMany({})]);
    console.log("🧹 Cleared users & tasks");

    // Passwords
    const commonPassword = "password123";
    const hash = await bcrypt.hash(commonPassword, 10);

    // Create Manager (DB role = admin)
    const manager = await User.create({
      name: "Manager Demo",
      email: "admin@example.com",
      role: "admin",
      passwordHash: hash,
    });

    // Create Members
    const members = await User.insertMany([
      {
        name: "Ali Member",
        email: "member@example.com",
        role: "member",
        passwordHash: hash,
      },
      {
        name: "Sara Member",
        email: "sara@example.com",
        role: "member",
        passwordHash: hash,
      },
      {
        name: "Hassan Member",
        email: "hassan@example.com",
        role: "member",
        passwordHash: hash,
      },
    ]);

    console.log("✅ Seeded users");

    const statuses = ["Todo", "In Progress", "Done"];
    const titles = [
      "Prepare weekly status report",
      "Fix login redirect edge case",
      "Review task assignment flow",
      "Update dashboard filters",
      "Add audit trail labels in UI",
      "Improve task table responsiveness",
      "Confirm RBAC coverage",
      "Add pagination to task list",
      "Write README documentation",
      "Deploy app to production",
    ];

    const descriptions = [
      "Please complete this task and update progress daily.",
      "Ensure behavior matches company internal tools and is stable.",
      "Follow best practices and keep code clean and readable.",
      "Implement with server-side filters and pagination for scalability.",
      "Add last-updated information visible on UI for traceability.",
    ];

    const tasks = [];
    for (let i = 0; i < 14; i++) {
      const assigned = randomPick(members);
      const status = randomPick(statuses);

      // Some tasks with due dates
      const dueDate =
        i % 3 === 0 ? new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000) : null;

      tasks.push({
        title: titles[i % titles.length] + (i >= titles.length ? ` #${i + 1}` : ""),
        description: randomPick(descriptions),
        assignedTo: assigned._id,
        status,
        dueDate,

        // Audit
        createdBy: manager._id,
        updatedBy: manager._id,
      });
    }

    await Task.insertMany(tasks);
    console.log("✅ Seeded tasks");

    console.log("\n==============================");
    console.log("✅ SEED COMPLETE");
    console.log("Manager (DB role: admin, UI: Manager)");
    console.log("Email: admin@example.com");
    console.log("Password: password123\n");
    console.log("Member");
    console.log("Email: member@example.com");
    console.log("Password: password123");
    console.log("==============================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
