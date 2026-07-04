import "dotenv/config";
import { connectDB } from "./src/config/db.js";
import { Branch } from "./src/models/Branch.js";
import { Doctor } from "./src/models/Doctor.js";
import { Appointment } from "./src/models/Appointment.js";

async function run() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected.");

    // Delete existing branches to clean up
    await Branch.deleteMany({});
    console.log("Cleared existing branches.");

    // Create branches
    const branches = await Branch.create([
      {
        name: "Maruthi Pet Clinic - Hyderabad",
        city: "Hyderabad",
        address: "Banjara Hills, Road No. 12, Hyderabad",
        phone: "+91-40-12345678",
        isActive: true
      },
      {
        name: "Maruthi Pet Clinic - Bangalore",
        city: "Bangalore",
        address: "Indiranagar, 100 Feet Rd, Bangalore",
        phone: "+91-80-87654321",
        isActive: true
      },
      {
        name: "Maruthi Pet Clinic - Chennai",
        city: "Chennai",
        address: "T. Nagar, Chennai",
        phone: "+91-44-11223344",
        isActive: true
      }
    ]);

    console.log(`Seeded ${branches.length} branches successfully.`);
    const defaultBranchId = branches[0]._id; // Hyderabad is default
    console.log(`Default branch ID (Hyderabad): ${defaultBranchId}`);

    // Update all doctors to default branch
    const docUpdateResult = await Doctor.updateMany(
      { branchId: { $exists: false } },
      { $set: { branchId: defaultBranchId } }
    );
    console.log(`Updated ${docUpdateResult.modifiedCount} doctors to default branch.`);

    // Update all appointments to default branch
    const apptUpdateResult = await Appointment.updateMany(
      { branchId: { $exists: false } },
      { $set: { branchId: defaultBranchId } }
    );
    console.log(`Updated ${apptUpdateResult.modifiedCount} appointments to default branch.`);

    // Also update any doctors who have null or empty branchId
    const nullDocResult = await Doctor.updateMany(
      { branchId: null },
      { $set: { branchId: defaultBranchId } }
    );
    console.log(`Updated ${nullDocResult.modifiedCount} doctors with null branchId to default.`);

    const nullApptResult = await Appointment.updateMany(
      { branchId: null },
      { $set: { branchId: defaultBranchId } }
    );
    console.log(`Updated ${nullApptResult.modifiedCount} appointments with null branchId to default.`);

    console.log("Database seeded and updated successfully!");
  } catch (error) {
    console.error("Error seeding branches:", error);
  } finally {
    process.exit(0);
  }
}

run();
