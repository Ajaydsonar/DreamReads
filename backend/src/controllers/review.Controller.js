import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHander } from "../utils/asyncHandler.js";

import { Review } from "../models/review.Model.js";
import { User } from "../models/user.Model.js";
import { Book } from "../models/book.Model.js";

const addReview = asyncHander(async (req, res) => {
  const { comment, rating } = req.body;
  const userId = req.user._id;
  const bookId = req.params.id;

  if (!(comment && rating))
    throw new ApiError(400, "comment and rating is missing...");

  if (!bookId) throw new ApiError("BookId is missing");

  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(200, "Book not Found!");

  const existedReview = await Review.findOne({
    user: userId,
    book: book._id,
  });

  if (existedReview)
    throw new ApiError(400, "Cannot add multiple reviews for the same book");

  const review = await Review.create({
    user: userId,
    book: book._id,
    comment,
    rating,
  });

  const createdReview = await Review.findById(review._id);

  if (!createdReview) {
    console.log(createdReview);
    throw new ApiError(500, "Something went wrong while creating review");
  }

  await Book.findOneAndUpdate(
    book._id,
    {
      $push: {
        ratings: createdReview._id,
      },
    },
    { new: true }
  );

  await User.findOneAndUpdate(
    userId,
    {
      $push: {
        ratings: createdReview._id,
      },
    },
    { new: true }
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdReview, "review Added Successfully"));
});

const updateReview = asyncHander(async (req, res) => {
  const { comment, rating } = req.body;

  const reviewId = req.params.id;
  const userId = req.user._id;

  if (!reviewId) throw new ApiError(400, "reviewId is missing...");

  if (!(comment && rating))
    throw new ApiError(400, "comment and rating is missing...");

  const review = await Review.findById(reviewId);

  if (!review) throw new ApiError(400, "Review Not Found");

  console.log("user :", userId);
  console.log("user review :", review.user);

  if (userId.toString() !== review.user.toString())
    throw new ApiError(409, "Unauthorized Request!");

  const updatedReview = await Review.findByIdAndUpdate(
    review._id,
    { comment, rating },
    { runValidators: true, new: true }
  );

  console.log("updated review: ", updatedReview);
  if (!updatedReview)
    throw new ApiError(500, "Something Went Wrong While Updating the Review");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedReview, "review updated Succesfully"));
});

const deleteReview = asyncHander(async (req, res) => {
  const userId = req.user._id;
  const reviewId = req.params.id;

  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, "User not Found!");

  if (userId.toString() !== review.user.toString())
    throw new ApiError(409, "Unauthorized Request!");

  await Review.findByIdAndDelete(review._id);

  await User.findByIdAndUpdate(review.user, {
    $pull: { ratings: review._id },
  });

  await Book.findByIdAndUpdate(review.book, {
    $pull: { ratings: review._id },
  });

  return res
    .status(204)
    .json(new ApiResponse(204, {}, "Review Deleted Successfully"));
});

const getReviewsByBook = asyncHander(async (req, res) => {
  const bookId = req.params.id;

  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found!");

  const reviews = await Review.find({ book: book._id });

  if (reviews.length < 1)
    return res.status(404).json(new ApiError(404, "Book has no review yet!"));

  return res
    .status(200)
    .json(new ApiResponse(200, reviews, "reviews fetched Successfully"));
});

export { addReview, updateReview, deleteReview, getReviewsByBook };
