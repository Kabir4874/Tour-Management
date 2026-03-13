import Booking from "../booking/booking.model.js";
import { PAYMENT_STATUS } from "../payment/payment.interface.js";
import Payment from "../payment/payment.model.js";
import { Tour } from "../tour/tour.model.js";
import { IsActive } from "../user/user.interface.js";
import User from "../user/user.model.js";

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
  const totalUserPromise = await User.countDocuments();

  const totalActiveUsersPromise = await User.countDocuments({
    isActive: IsActive.ACTIVE,
  });
  const totalInActiveUsersPromise = await User.countDocuments({
    isActive: IsActive.INACTIVE,
  });
  const totalBlockedUsersPromise = await User.countDocuments({
    isActive: IsActive.BLOCKED,
  });

  const newUsersInLastSevenDaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  const newUsersInLastThirtyDaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const usersByRolePromise = User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const [
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUsersInLastSevenDays,
    newUsersInLastThirtyDays,
    usersByRole,
  ] = await Promise.all([
    totalUserPromise,
    totalActiveUsersPromise,
    totalInActiveUsersPromise,
    totalBlockedUsersPromise,
    newUsersInLastSevenDaysPromise,
    newUsersInLastThirtyDaysPromise,
    usersByRolePromise,
  ]);

  return {
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUsersInLastSevenDays,
    newUsersInLastThirtyDays,
    usersByRole,
  };
};

const getTourStats = async () => {
  const totalTourPromise = Tour.countDocuments();

  const totalTourByTourTypePromise = Tour.aggregate([
    {
      $lookup: {
        from: "tourtypes",
        localField: "tourType",
        foreignField: "_id",
        as: "type",
      },
    },
    {
      $unwind: "$type",
    },
    {
      $group: {
        _id: "$type.name",
        count: { $sum: 1 },
      },
    },
  ]);

  const avgTourCostPromise = Tour.aggregate([
    {
      $group: {
        _id: null,
        avgCostFrom: { $avg: "$costFrom" },
      },
    },
  ]);

  const totalTourByDivisionPromise = Tour.aggregate([
    {
      $lookup: {
        from: "divisions",
        localField: "division",
        foreignField: "_id",
        as: "division",
      },
    },

    {
      $unwind: "$division",
    },

    {
      $group: {
        _id: "$division.name",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalHighestBookedTourPromise = Booking.aggregate([
    {
      $group: {
        _id: "$tour",
        bookingCount: { $sum: 1 },
      },
    },

    {
      $sort: { bookingCount: -1 },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "tours",
        let: { tourId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$tourId"] },
            },
          },
        ],
        as: "tour",
      },
    },
    { $unwind: "$tour" },

    {
      $project: {
        bookingCount: 1,
        "tour.title": 1,
        "tour.slug": 1,
      },
    },
  ]);

  const [
    totalTour,
    totalTourByTourType,
    avgTourCost,
    totalTourByDivision,
    totalHighestBookedTour,
  ] = await Promise.all([
    totalTourPromise,
    totalTourByTourTypePromise,
    avgTourCostPromise,
    totalTourByDivisionPromise,
    totalHighestBookedTourPromise,
  ]);

  return {
    totalTour,
    totalTourByTourType,
    avgTourCost,
    totalTourByDivision,
    totalHighestBookedTour,
  };
};

const getBookingStats = async () => {
  const totalBookingPromise = Booking.countDocuments();

  const totalBookingByStatusPromise = Booking.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const bookingsPerTourPromise = Booking.aggregate([
    {
      $group: {
        _id: "$tour",
        bookingCount: { $sum: 1 },
      },
    },

    {
      $sort: { bookingCount: -1 },
    },

    {
      $limit: 10,
    },

    {
      $lookup: {
        from: "tours",
        localField: "_id",
        foreignField: "_id",
        as: "tour",
      },
    },

    {
      $unwind: "$tour",
    },

    {
      $project: {
        bookingCount: 1,
        _id: 1,
        "tour.title": 1,
        "tour.slug": 1,
      },
    },
  ]);

  const avgGuestCountPerBookingPromise = Booking.aggregate([
    {
      $group: {
        _id: null,
        avgGuestCount: { $avg: "$guestCount" },
      },
    },
  ]);

  const bookingsLastSevenDaysPromise = Booking.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const bookingsLastThirtyDaysPromise = Booking.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const totalBookingByUniqueUsersPromise = Booking.distinct("user").then(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (user: any) => user.length,
  );

  const [
    totalBooking,
    totalBookingByStatus,
    bookingsPerTour,
    avgGuestCountPerBooking,
    bookingsLastSevenDays,
    bookingsLastThirtyDays,
    totalBookingByUniqueUsers,
  ] = await Promise.all([
    totalBookingPromise,
    totalBookingByStatusPromise,
    bookingsPerTourPromise,
    avgGuestCountPerBookingPromise,
    bookingsLastSevenDaysPromise,
    bookingsLastThirtyDaysPromise,
    totalBookingByStatusPromise,
    totalBookingByUniqueUsersPromise,
  ]);

  return {
    totalBooking,
    totalBookingByStatus,
    bookingsPerTour,
    avgGuestCountPerBooking: avgGuestCountPerBooking[0].avgGuestCount,
    bookingsLastSevenDays,
    bookingsLastThirtyDays,
    totalBookingByUniqueUsers,
  };
};

const getPaymentStats = async () => {
  const totalPaymentPromise = Payment.countDocuments();

  const totalPaymentByStatusPromise = Payment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalRevenuePromise = Payment.aggregate([
    {
      $match: { status: PAYMENT_STATUS.PAID },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);

  const avgPaymentAmountPromise = Payment.aggregate([
    {
      $group: {
        _id: null,
        avgPaymentAMount: { $avg: "$amount" },
      },
    },
  ]);

  const paymentGatewayDataPromise = Payment.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$paymentGatewayData.status", "UNKNOWN"] },
        count: { $sum: 1 },
      },
    },
  ]);

  const [
    totalPayment,
    totalPaymentByStatus,
    totalRevenue,
    avgPaymentAmount,
    paymentGatewayData,
  ] = await Promise.all([
    totalPaymentPromise,
    totalPaymentByStatusPromise,
    totalRevenuePromise,
    avgPaymentAmountPromise,
    paymentGatewayDataPromise,
  ]);
  return {
    totalPayment,
    totalPaymentByStatus,
    totalRevenue,
    avgPaymentAmount,
    paymentGatewayData,
  };
};

export const StatsService = {
  getBookingStats,
  getPaymentStats,
  getTourStats,
  getUserStats,
};
