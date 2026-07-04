import mongoose from "mongoose";
import dns from "node:dns";

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  const dnsServers = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  try {
    dns.setServers(dnsServers);
  } catch (dnsErr) {
    console.warn("Failed to set custom DNS servers, using default resolver:", dnsErr.message);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
}
