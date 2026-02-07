import { model, Schema } from "mongoose";
import { PAYMENT_STATUS, type IPayment } from "./payment.interface.js";

const paymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    transactionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    amount: { type: Number, required: true },
    paymentGatewayData: { type: Schema.Types.Mixed },
    invoiceUrl: { type: String },
  },
  { timestamps: true },
);

const Payment = model<IPayment>("Payment", paymentSchema);

export default Payment;
