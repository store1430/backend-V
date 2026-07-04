import "dotenv/config";
import fs from 'fs';
import path from 'path';
import { connectDB } from "./src/config/db.js";
import { Doctor } from "./src/models/Doctor.js";
import { imagekit } from "./src/config/imagekit.js";

const doctorsWithImages = [
  {
    name: "Dr. Rajesh Kumar",
    imagePath: "C:\\Users\\USER\\.gemini\\antigravity\\brain\\0f7e1913-3903-4957-8972-1d964db67c13\\rajesh_doctor_1782483785131.jpg"
  },
  {
    name: "Dr. Sneha Sharma",
    imagePath: "C:\\Users\\USER\\.gemini\\antigravity\\brain\\0f7e1913-3903-4957-8972-1d964db67c13\\sneha_doctor_1782483800718.jpg"
  },
  {
    name: "Dr. Amit Patel",
    imagePath: "C:\\Users\\USER\\.gemini\\antigravity\\brain\\0f7e1913-3903-4957-8972-1d964db67c13\\amit_doctor_1782483818526.jpg"
  },
  {
    name: "Dr. Priya Kumar",
    imagePath: "C:\\Users\\USER\\.gemini\\antigravity\\brain\\0f7e1913-3903-4957-8972-1d964db67c13\\priya_doctor_1782483835950.jpg"
  }
];

async function run() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected.");

    for (const item of doctorsWithImages) {
      console.log(`Processing ${item.name}...`);
      const doctor = await Doctor.findOne({ name: item.name });
      if (!doctor) {
        console.error(`Doctor ${item.name} not found in database!`);
        continue;
      }

      if (!fs.existsSync(item.imagePath)) {
        console.error(`File does not exist: ${item.imagePath}`);
        continue;
      }

      const fileBuffer = fs.readFileSync(item.imagePath);
      const uploaded = await imagekit.upload({
        file: fileBuffer.toString("base64"),
        fileName: `doctor-${Date.now()}-${path.basename(item.imagePath)}`,
        folder: "/maruthi-pet-clinic/doctors"
      });

      doctor.imageUrl = uploaded.url;
      doctor.imageFileId = uploaded.fileId;
      await doctor.save();
      console.log(`Successfully updated ${item.name} with image: ${uploaded.url}`);
    }

  } catch (error) {
    console.error("Error updating doctor images:", error);
  } finally {
    process.exit(0);
  }
}

run();
