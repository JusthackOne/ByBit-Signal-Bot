import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITrackable extends Document {
  _id: string;
  symbol: string;
  created: number;
}

export type ITrackableModel = Model<ITrackable>;

export const TrackableSchema: Schema<ITrackable> = new Schema({
  symbol: { type: String, unique: true },
  created: { type: Date, default: Date.now }
});

const Trackable: ITrackableModel = mongoose.model<ITrackable>(
  "Trackable",
  TrackableSchema
);
export default Trackable;
