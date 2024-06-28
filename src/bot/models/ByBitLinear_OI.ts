import mongoose, { Document } from "mongoose";

export interface IByBitLinear_OI extends Document {
  _id: string;
  symbol: string;
  last_update: Date;
  openInterestValue: number;
  lastPrice: number;
  h24_signal_count: number;
}

export const ByBitLinear_OI_Schema = new mongoose.Schema({
  symbol: { type: String, unique: true },
  last_update: { type: Date, default: Date.now },
  openInterestValue: Number,
  lastPrice: Number,
  h24_signal_count: Number
});

const ByBitLinear_OI = mongoose.model<IByBitLinear_OI>(
  "ByBitLinear_OI",
  ByBitLinear_OI_Schema
);
export default ByBitLinear_OI;
