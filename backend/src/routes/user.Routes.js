import { Router } from "express";
import {
  loginUser,
  registerUser,
  updateUserDetails,
} from "../controllers/user.Controller.js";
import { verifyUserJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

///secured routes
router.route("/update-user-details").post(verifyUserJWT, updateUserDetails);

export default router;
