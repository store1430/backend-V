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

  dns.setServers(dnsServers);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
}
