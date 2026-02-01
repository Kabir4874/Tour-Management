import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError.js";
import { PAYMENT_STATUS } from "../payment/payment.interface.js";
import Payment from "../payment/payment.model.js";
import { Tour } from "../tour/tour.model.js";
import User from "../user/user.model.js";
import { BOOKING_STATUS, type IBooking } from "./booking.interface.js";
import Booking from "./booking.model.js";

const getTransactionId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

const createBooking = async (payload: IBooking, userId: string) => {
  const transactionId = getTransactionId();

  const session = await Booking.startSession();
  session.startTransaction();

  try {
  } catch (error) {}

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

  const booking = await Booking.create({
    ...payload,
    user: userId,
    status: BOOKING_STATUS.PENDING,
  });

  const payment = await Payment.create({
    booking: booking._id,
    status: PAYMENT_STATUS.UNPAID,
    transactionId,
    amount,
  });

  const updatedBooking = await Booking.findByIdAndUpdate(
    booking._id,
    {
      payment: payment._id,
    },
    { new: true, runValidators: true },
  )
    .populate("user", "name email phone address")
    .populate("tour", "title costFrom")
    .populate("payment");

  return updatedBooking;
};

export const BookingService = {
  createBooking,
};
