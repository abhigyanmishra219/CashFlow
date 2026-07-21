import mongoose, { Schema } from "mongoose";

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    taskType: {
      type: String,
      enum: [
        "Lead Call",
        "Demo",
        "Document Collection",
        "Fee Collection",
        "Batch Allocation",
        "Welcome Onboarding",
        "EMI Recovery",
        "General"
      ],
      default: "General",
    },
    linkedStudentId: {
      type: String,
      trim: true,
    },
    linkedStudentName: {
      type: String,
      trim: true,
    },
    linkedEnquiryId: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: String,
      required: [true, "Assigned user/counsellor is required"],
      trim: true,
    },
    assignedRole: {
      type: String,
      default: "counsellor",
    },
    createdBy: {
      type: String,
      default: "System Engine",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent / Escalated"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Overdue", "Escalated"],
      default: "Pending",
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    checklist: [
      {
        text: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
      },
    ],
    comments: [
      {
        author: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalatedToManager: {
      type: String,
      trim: true,
    },
    autoTriggerSource: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model re-compilation error in Next.js development hot-reloads
const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;
