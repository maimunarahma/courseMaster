import mongoose, { Schema, Document } from 'mongoose';

interface ISubmission {
  studentId: mongoose.Types.ObjectId;
  submittedAt: Date;
  documentLink: string;
  checked: boolean;
  score?: number; // optional, if you want to assign a score
}

export interface IAssignment extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  submissions: ISubmission[];
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
  studentId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  submittedAt: { type: Date, default: Date.now },
  documentLink: { type: String, required: true },
  checked: { type: Boolean, default: false },
  score: { type: Number },
});

const AssignmentSchema = new Schema<IAssignment>({
  courseId: { type: mongoose.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String },
  description: { type: String },
  dueDate: { type: Date },
  submissions: [SubmissionSchema],
}, { timestamps: true });

const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment;
