import mongoose, { Document } from "mongoose";

export interface IByBitLinear_OI extends Document {
  _id: string;
  symbol: string;
  last_update_growth: Date;
  last_update_recession: Date;
  openInterestValueGrowth: number;
  openInterestValueRecession: number;
  lastPriceGrowth: number;
  lastPriceRecession: number;
  h24_signal_count_recession: number;
  h24_signal_count_growth: number;
}

export const ByBitLinear_OI_Schema = new mongoose.Schema({
  symbol: { type: String, unique: true },
  last_update_growth: { type: Date, default: Date.now },
  last_update_recession: { type: Date, default: Date.now },
  openInterestValueGrowth: Number,
  openInterestValueRecession: Number,
  lastPriceGrowth: Number,
  lastPriceRecession: Number,
  h24_signal_count_recession: Number,
  h24_signal_count_growth: Number
});

const ByBitLinear_OI = mongoose.model<IByBitLinear_OI>(
  "ByBitLinear_OI",
  ByBitLinear_OI_Schema
);
export default ByBitLinear_OI;
