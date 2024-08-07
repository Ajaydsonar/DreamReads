import { Router } from "express";
import { verifyJWT, verifyUserJWT } from "../middlewares/auth.middlewares.js";
import {
  addReview,
  deleteReview,
  getReviewsByBook,
  updateReview,
} from "../controllers/review.Controller.js";

const router = Router();

router.route("/:id/add").post(verifyUserJWT, addReview);

router.route("/:id/update").post(verifyUserJWT, updateReview);
router.route("/:id/delete").post(verifyUserJWT, deleteReview);
router.route("/u/:id").get(verifyUserJWT, getReviewsByBook);
router.route("/a/:id").get(verifyJWT, getReviewsByBook);

export default router;
