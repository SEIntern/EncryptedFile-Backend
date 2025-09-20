import cron from "node-cron";
import Admin from "../models/admins.model.js";
import Manager from "../models/managers.model.js";
import User from "../models/users.model.js";

console.log("cron is running");


cron.schedule("0 0 * * *", async () => {
  console.log("🔍 Checking expired admin subscriptions...");

  const now = new Date();

  const expiredAdmins = await Admin.find({
    "subscription.end_date": { $lt: now },
    isBlocked: false
  });

  for (let admin of expiredAdmins) {
    console.log(`⛔ Blocking admin ${admin._id}`);

    // Block the admin
    admin.isBlocked = true;
    admin.is_subscription_expired = true;
    await admin.save();

    // Block managers
    await Manager.updateMany({ admin_id: admin._id }, { isBlocked: true });

    // Block users
    await User.updateMany({ admin_id: admin._id }, { isBlocked: true });
  }
});
