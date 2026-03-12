import { StatusCodes } from "http-status-codes";
import envVars from "../../config/env.js";
import { catchAsync } from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { PaymentService } from "./payment.service.js";

const initPayment = catchAsync(async (req, res) => {
  const bookingId = req.params.bookingId as string;
  const result = await PaymentService.initPayment(bookingId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment done",
    data: result,
  });
});

const successPayment = catchAsync(async (req, res) => {
  const query = req.query as Record<string, string>;
  const result = await PaymentService.successPayment(query);
  if (result.success) {
    res.redirect(
      `${envVars.SSL.SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=success`,
    );
  }
});

const failPayment = catchAsync(async (req, res) => {
  const query = req.query as Record<string, string>;
  const result = await PaymentService.failPayment(query);
  if (!result.success) {
    res.redirect(
      `${envVars.SSL.FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=fail`,
    );
  }
});

const cancelPayment = catchAsync(async (req, res) => {
  const query = req.query as Record<string, string>;
  const result = await PaymentService.cancelPayment(query);
  if (!result.success) {
    res.redirect(
      `${envVars.SSL.CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=cancel`,
    );
  }
});

const getInvoiceDownloadUrl = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const result = await PaymentService.getInvoiceDownloadUrl(
    paymentId as string,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Invoice download URL retrieved successfully",
    data: result,
  });
});

export const PaymentController = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceDownloadUrl,
};
