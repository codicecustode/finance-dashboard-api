import mongoose from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     FinancialRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         amount:
 *           type: number
 *           example: 1500.00
 *         type:
 *           type: string
 *           enum: [income, expense]
 *         category:
 *           type: string
 *           example: salary
 *         date:
 *           type: string
 *           format: date
 *         description:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         isDeleted:
 *           type: boolean
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const RECORD_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

const CATEGORIES = [
  // Income categories
  'salary',
  'freelance',
  'investment',
  'rental',
  'bonus',
  'refund',
  'other_income',
  // Expense categories
  'food',
  'transport',
  'utilities',
  'healthcare',
  'entertainment',
  'shopping',
  'education',
  'rent',
  'insurance',
  'subscription',
  'other_expense',
];

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: Object.values(RECORD_TYPES),
        message: 'Type must be income or expense',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      lowercase: true,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for common query patterns
financialRecordSchema.index({ type: 1, date: -1 });
financialRecordSchema.index({ category: 1 });
financialRecordSchema.index({ date: -1 });
financialRecordSchema.index({ isDeleted: 1 });
financialRecordSchema.index({ createdBy: 1 });

// Default filter to exclude soft-deleted records
financialRecordSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  }
  // Clean up helper flag
  delete this.getQuery().includeDeleted;
  next();
});

const FinancialRecord = mongoose.model('FinancialRecord', financialRecordSchema);

export  { FinancialRecord, RECORD_TYPES, CATEGORIES };
