import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import { Challan, PassportSlot } from "../lib/models";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in .env.local");
    process.exit(1);
}

async function runSchemaAndSeed() {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Connected to MongoDB Atlas.");

    // Clear existing mock data
    await Challan.deleteMany({});
    await PassportSlot.deleteMany({});

    // Insert Mock Challans
    await Challan.insertMany([
        { vehicleNo: "DL01AB1234", challanId: "CH-8921", offense: "Over-speeding", amount: 1000, date: "2026-08-15", status: "PENDING" },
        { vehicleNo: "MH02CD5678", challanId: "CH-4412", offense: "Signal Jump", amount: 500, date: "2026-08-20", status: "PENDING" }
    ]);

    // Insert Mock Passport Slots
    await PassportSlot.insertMany([
        { location: "Delhi PSK", category: "Normal", availableDate: "2026-09-02", slotsRemaining: 15 },
        { location: "Mumbai PSK", category: "Tatkaal", availableDate: "2026-08-30", slotsRemaining: 4 }
    ]);

    console.log("✅ Schema initialized and mock records inserted successfully!");
    await mongoose.disconnect();
}

runSchemaAndSeed().catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
});