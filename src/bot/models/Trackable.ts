import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITrackable extends Document {
  _id: string;
  symbol: string;
  created: number;
  type: 'spot' | 'linear'
}

export type ITrackableModel = Model<ITrackable>;

export const TrackableSchema: Schema<ITrackable> = new Schema({
  symbol: { type: String, unique: true },
  created: { type: Date, default: Date.now },
  type: String
});

const Trackable: ITrackableModel = mongoose.model<ITrackable>(
  "Trackable",
  TrackableSchema
);
export default Trackable;
