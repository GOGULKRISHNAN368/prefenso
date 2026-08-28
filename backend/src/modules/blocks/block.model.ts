import { Schema, model, Types } from 'mongoose';

export interface BlockDocument {
  name: string;
  code: string;
  displayOrder: number;
  isActive: boolean;
  credentialsConfigured: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const blockSchema = new Schema<BlockDocument>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  credentialsConfigured: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Block = model<BlockDocument>('Block', blockSchema);
