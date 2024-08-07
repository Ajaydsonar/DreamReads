import { Router } from "express";
import { verifyJWT, verifyUserJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addBook,
  deleteBook,
  getAllBooks,
  getBookById,
  publishBook,
  updateBookDetails,
  updateCoverImage,
} from "../controllers/book.Controller.js";

const router = Router();

router.route("/add").post(verifyJWT, upload.single("coverImage"), addBook);
router.route("/update/:id").post(verifyJWT, updateBookDetails);
router.route("/:id/publish").post(verifyJWT, publishBook);
router
  .route("/:id/update-cover-image")
  .post(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/delete/:id").post(verifyJWT, deleteBook);

router.route("/a/:id").get(verifyJWT, getBookById);
router.route("/a").get(verifyJWT, getAllBooks);

router.route("/u/:id").get(verifyUserJWT, getBookById);
router.route("/u").get(verifyUserJWT, getAllBooks);

export default router;
