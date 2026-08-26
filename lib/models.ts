import mongoose, { Schema, model, models } from "mongoose";

// Parivahan Challan Schema
const ChallanSchema = new Schema({
    vehicleNo: { type: String, required: true, uppercase: true, index: true },
    challanId: { type: String, required: true, unique: true },
    offense: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" }
});

// Passport Slot Schema
const PassportSlotSchema = new Schema({
    location: { type: String, required: true },
    category: { type: String, enum: ["Normal", "Tatkaal"], default: "Normal" },
    availableDate: { type: String, required: true },
    slotsRemaining: { type: Number, default: 10 }
});

export const Challan = models.Challan || model("Challan", ChallanSchema);
export const PassportSlot = models.PassportSlot || model("PassportSlot", PassportSlotSchema);