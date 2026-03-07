import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError.js";
import getTransactionId from "../../utils/getTransactionId.js";
import { PAYMENT_STATUS } from "../payment/payment.interface.js";
import Payment from "../payment/payment.model.js";
import type { ISSLCommerz } from "../sslCommerz/sslCommerz.interface.js";
import { SSLService } from "../sslCommerz/sslCommerz.service.js";
import { Tour } from "../tour/tour.model.js";
import User from "../user/user.model.js";
import { BOOKING_STATUS, type IBooking } from "./booking.interface.js";
import Booking from "./booking.model.js";

const createBooking = async (payload: IBooking, userId: string) => {
  const transactionId = getTransactionId();

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);

    if (!user?.phone || !user?.address) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Please update your profile to book a tour.",
      );
    }

    const tour = await Tour.findById(payload.tour).select("costFrom");

    if (!tour?.costFrom) {
      throw new AppError(StatusCodes.BAD_REQUEST, "No tour cost found.");
    }

    const amount = Number(tour.costFrom) * Number(payload.guestCount);

    const [booking] = await Booking.create(
      [
        {
          ...payload,
          user: userId,
          status: BOOKING_STATUS.PENDING,
        },
      ],
      { session },
    );
    if (!booking) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Booking creation failed.",
      );
    }

    const [payment] = await Payment.create(
      [
        {
          booking: booking._id,
          status: PAYMENT_STATUS.UNPAID,
          transactionId,
          amount,
        },
      ],
      { session },
    );
    if (!payment) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Payment creation failed.",
      );
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking._id,
      {
        payment: payment._id,
      },
      { new: true, runValidators: true, session },
    )
      .populate("user", "name email phone address")
      .populate("tour", "title costFrom")
      .populate("payment");

    const sslPayload: ISSLCommerz = {
      address: user.address,
      email: user.email,
      phoneNumber: user.phone,
      name: user.name,
      amount,
      transactionId,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    await session.commitTransaction();
    session.endSession();

    return { booking: updatedBooking, paymentUrl: sslPayment.GatewayPageUrl };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const BookingService = {
  createBooking,
};
