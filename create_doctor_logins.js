import "dotenv/config";
import { connectDB } from "./src/config/db.js";
import { Doctor } from "./src/models/Doctor.js";
import bcrypt from "bcryptjs";

async function run() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected.");

    const doctors = await Doctor.find({});
    console.log(`Found ${doctors.length} doctors. Updating login credentials...`);

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash("123", salt);

    for (const doc of doctors) {
      let username = "";
      if (doc.name.includes("Rajesh")) username = "rajesh";
      else if (doc.name.includes("Sneha")) username = "sneha";
      else if (doc.name.includes("Amit")) username = "amit";
      else if (doc.name.includes("Priya")) username = "priya";
      else {
        const cleanName = doc.name.replace("Dr. ", "").trim();
        username = cleanName.split(" ")[0].toLowerCase();
      }

      console.log(`Setting ${doc.name} username: ${username}, password: 123`);
      
      doc.username = username;
      doc.password = defaultPasswordHash;
      await doc.save();
      console.log(`Successfully updated ${doc.name}`);
    }

    console.log("Updates completed successfully!");
  } catch (error) {
    console.error("Error during updates:", error);
  } finally {
    process.exit(0);
  }
}

run();
