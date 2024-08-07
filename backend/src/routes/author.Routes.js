import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  loginAuthor,
  logoutAuthor,
  registerAuthor,
  refreshAccessToken,
  verifyEmail,
} from "../controllers/author.Controller.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerAuthor);

router.route("/verify-email/:token").get(verifyEmail);

router.route("/login").post(loginAuthor);

//secured routes

router.route("/logout").post(verifyJWT, logoutAuthor);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
