import bcrypt from "bcryptjs";
import envVars from "../config/env.js";
import {
  IProvider,
  Role,
  type IAuthProvider,
  type IUser,
} from "../modules/user/user.interface.js";
import User from "../modules/user/user.model.js";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    });
    if (isSuperAdminExist) {
      console.log("Super admin already exist");
      return;
    }
    const hashedPassword = await bcrypt.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      envVars.BCRYPT_SALT_ROUND
    );
    const authProvider: IAuthProvider = {
      provider: IProvider.CREDENTIALS,
      providerId: envVars.SUPER_ADMIN_EMAIL,
    };
    const payload: IUser = {
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      email: envVars.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      auths: [authProvider],
      isVerified: true,
    };
    await User.create(payload);
    console.log("Super admin created successfully");
  } catch (error) {
    console.error(error);
  }
};
