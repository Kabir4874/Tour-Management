import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError.js";
import { BOOKING_STATUS } from "../booking/booking.interface.js";
import Booking from "../booking/booking.model.js";
import { SSLService } from "../sslCommerz/sslCommerz.service.js";
import { PAYMENT_STATUS } from "./payment.interface.js";
import Payment from "./payment.model.js";

const initPayment = async (bookingId: string) => {
  const payment = await Payment.findOne({ booking: bookingId });
  if (!payment) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Payment not found. You have not booked this tour",
    );
  }

  const booking = await Booking.findById(payment.booking)
    .populate("user", "name email phone address")
    .populate("tour", "title");

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, "Booking not found");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = booking.user as any;

  const sslPayload = {
    amount: payment.amount,
    transactionId: payment.transactionId,
    name: user.name,
    email: user.email,
    phoneNumber: user.phone,
    address: user.address,
  };

  const sslPayment = await SSLService.sslPaymentInit(sslPayload);

  return { paymentUrl: sslPayment.GatewayPageUrl };
};

const successPayment = async (query: Record<string, string>) => {
  const transactionId = query.transactionId;

  if (!transactionId) {
    throw new Error("Transaction ID is required");
  }

  const session = await Payment.startSession();
  session.startTransaction();
  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId },
      {
        status: PAYMENT_STATUS.PAID,
      },
      { runValidators: true, session },
    );

    if (!updatedPayment) {
      throw new Error("Payment not found");
    }

    await Booking.findByIdAndUpdate(
      updatedPayment.booking,
      {
        status: BOOKING_STATUS.COMPLETE,
      },
      { runValidators: true, session },
    );

    await session.commitTransaction();
    session.endSession();

    return { success: true, message: "Payment completed successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const failPayment = async (query: Record<string, string>) => {
  const transactionId = query.transactionId;

  if (!transactionId) {
    throw new Error("Transaction ID is required");
  }

  const session = await Payment.startSession();
  session.startTransaction();
  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId },
      {
        status: PAYMENT_STATUS.FAILED,
      },
      { runValidators: true, session },
    );

    if (!updatedPayment) {
      throw new Error("Payment not found");
    }

    await Booking.findByIdAndUpdate(
      updatedPayment.booking,
      {
        status: BOOKING_STATUS.FAILED,
      },
      { runValidators: true, session },
    );

    await session.commitTransaction();
    session.endSession();

    return { success: false, message: "Payment failed" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cancelPayment = async (query: Record<string, string>) => {
  const transactionId = query.transactionId;

  if (!transactionId) {
    throw new Error("Transaction ID is required");
  }

  const session = await Payment.startSession();
  session.startTransaction();
  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId },
      {
        status: PAYMENT_STATUS.CANCELLED,
      },
      { runValidators: true, session },
    );

    if (!updatedPayment) {
      throw new Error("Payment not found");
    }

    await Booking.findByIdAndUpdate(
      updatedPayment.booking,
      {
        status: BOOKING_STATUS.CANCEL,
      },
      { runValidators: true, session },
    );

    await session.commitTransaction();
    session.endSession();

    return { success: false, message: "Payment cancelled" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const PaymentService = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
};
