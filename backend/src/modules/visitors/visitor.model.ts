import { Schema, model, Types } from 'mongoose';

export type VisitorStatus = 'INSIDE' | 'EXITED';
export interface VisitorDocument {
  visitorCode: string;
  visitorName: string;
  phoneNumber: string;
  reasonForVisit: string;
  personToMeet?: string;
  blockId: Types.ObjectId;
  checkInAt: Date;
  checkOutAt: Date | null;
  status: VisitorStatus;
  checkedInBy: Types.ObjectId;
  checkedOutBy: Types.ObjectId | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const visitorSchema = new Schema<VisitorDocument>({
  visitorCode: { type: String, unique: true, index: true },
  visitorName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true, index: true },
  reasonForVisit: { type: String, required: true, trim: true },
  personToMeet: { type: String, trim: true },
  blockId: { type: Schema.Types.ObjectId, ref: 'Block', required: true, index: true },
  checkInAt: { type: Date, required: true },
  checkOutAt: { type: Date, default: null },
  status: { type: String, enum: ['INSIDE', 'EXITED'], default: 'INSIDE', index: true },
  checkedInBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  checkedOutBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  notes: { type: String, trim: true }
}, { timestamps: true });

visitorSchema.index({ blockId: 1, checkInAt: -1 });
visitorSchema.index({ blockId: 1, status: 1 });
visitorSchema.index({ status: 1, checkInAt: -1 });
export const Visitor = model<VisitorDocument>('Visitor', visitorSchema);
