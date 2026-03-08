import z from "zod";

const passwordZodSchema = z
  .string({ error: "Password must be string" })
  .min(8, { message: "Password must be at least 8 characters long." })
  .regex(/^(?=.*[A-Z])/, {
    message: "Password must contain at least 1 uppercase letter.",
  })
  .regex(/^(?=.*[!@#$%^&*])/, {
    message: "Password must contain at least 1 special character.",
  })
  .regex(/^(?=.*\d)/, {
    message: "Password must contain at least 1 number.",
  });

export const credentialsLoginZodSchema = z.object({
  email: z
    .string({ error: "Email must be string" })
    .email({ message: "Invalid email address format." }),
  password: z.string({ error: "Password must be string" }).min(1, {
    message: "Password is required.",
  }),
});

export const forgotPasswordZodSchema = z.object({
  email: z
    .string({ error: "Email must be string" })
    .email({ message: "Invalid email address format." }),
});

export const resetPasswordZodSchema = z.object({
  id: z.string({ error: "User id must be string" }).min(1, {
    message: "User id is required.",
  }),
  newPassword: passwordZodSchema,
});

export const changePasswordZodSchema = z.object({
  oldPassword: z.string({ error: "Old password must be string" }).min(1, {
    message: "Old password is required.",
  }),
  newPassword: passwordZodSchema,
});

export const setPasswordZodSchema = z.object({
  password: passwordZodSchema,
});
