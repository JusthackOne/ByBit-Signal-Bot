import mongoose, { Document } from "mongoose";

export interface IConfig extends Document {
  _id: string;
  symbol: string;
  created: number;
  oi_growth_period: number;
  oi_recession_period: number;
  oi_growth_percentage: number;
  oi_recession_percentage: number;
}

export const ConfigSchema = new mongoose.Schema({
  oi_growth_period: Number,
  oi_recession_period: Number,
  oi_growth_percentage: Number,
  oi_recession_percentage: Number
});

const Config = mongoose.model<IConfig>("Config", ConfigSchema);
export default Config;
