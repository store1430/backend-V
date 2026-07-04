import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import serviceCategoryRoutes from "./routes/serviceCategories.js";
import appointmentRoutes from "./routes/appointments.js";
import petHistoryRoutes from "./routes/petHistories.js";
import doctorRoutes from "./routes/doctors.js";
import bannerRoutes from "./routes/banners.js";
import branchRoutes from "./routes/branches.js";
import staffRoutes from "./routes/staff.js";
import { attachSignaling } from "./realtime/signaling.js";

const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.CLIENT_ORIGIN || "*";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/service-categories", serviceCategoryRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/pet-history", petHistoryRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/staff", staffRoutes);

attachSignaling(io);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || "Internal server error" });
});

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(port, () => console.log(`API and signaling server running on ${port}`));
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
