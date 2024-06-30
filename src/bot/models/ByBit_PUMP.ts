import mongoose, { Document } from "mongoose";

export interface IByBit_PUMP extends Document {
  _id: string;
  symbol: string;
  last_update_growth: Date;
  last_update_recession: Date;
  priceGrowth: number;
  priceRecession: number;

  h24_signal_count_recession: number;
  h24_signal_count_growth: number;
}

export const ByBit_PUMP_Shema = new mongoose.Schema({
  symbol: { type: String, unique: true },
  last_update_growth: { type: Date, default: Date.now },
  last_update_recession: { type: Date, default: Date.now },
  priceGrowth: Number,
  priceRecession: Number,
  h24_signal_count_recession: Number,
  h24_signal_count_growth: Number
});

const ByBit_PUMP = mongoose.model<IByBit_PUMP>("ByBit_PUMP", ByBit_PUMP_Shema);
export default ByBit_PUMP;
