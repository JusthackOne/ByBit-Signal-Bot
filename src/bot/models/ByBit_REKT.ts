import mongoose, { Document } from "mongoose";

export interface IByBit_REKT extends Document {
  _id: string;
  symbol: string;

  h24_signal_count_liq: number;
}

export const ByBit_REKT_Shema = new mongoose.Schema({
  symbol: { type: String, unique: true },

  h24_signal_count_liq: Number
});

const ByBit_REKT = mongoose.model<IByBit_REKT>("ByBit_REKT", ByBit_REKT_Shema);
export default ByBit_REKT;
