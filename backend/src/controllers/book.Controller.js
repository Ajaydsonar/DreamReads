import { Author } from "../models/author.Model.js";
import { Book } from "../models/book.Model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHander } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const addBook = asyncHander(async (req, res) => {
  const { title, description, genre } = req.body;
  const author_id = req.author._id;

  if (!author_id) throw new ApiError(409, "Unauthorized Request");

  if (
    [title, description, genre].some(
      (field) => field === undefined || field === null || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "Please Enter Book details correctly");
  }

  const coverImagelocalPath = req.file?.path;

  if (!coverImagelocalPath)
    throw new ApiError(400, "Please Provide book cover image");

  const coverImage = await uploadOnCloudinary(coverImagelocalPath);

  const book = await Book.create({
    title,
    description,
    genre,
    coverImage,
    author: author_id,
  });

  const createdBook = await Book.findById(book._id);

  if (!createdBook) {
    throw new ApiError(500, "Something Went Wrong While adding the book");
  }

  await Author.findByIdAndUpdate(
    author_id,
    {
      $push: { books: createdBook._id },
    },
    { new: true }
  );

  return res
    .status(201)
    .json(new ApiResponse(204, createdBook, "Book Added Successfully"));
});

const updateBookDetails = asyncHander(async (req, res) => {
  const { title, description, genre, status } = req.body;
  const bookId = req.params.id;

  if (!bookId) throw new ApiError(400, "Invalid Book Id");

  if (
    [title, description, genre].some(
      (field) => field === undefined || field === null || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "Please Enter Book details correctly");
  }

  if (status !== "draft" && status !== "published")
    throw new ApiError(400, "Invalid Status value");

  const updatedBook = await Book.findByIdAndUpdate(
    bookId,
    {
      title,
      description,
      genre,
      status,
    },
    { new: true, runValidators: true }
  );

  if (!updatedBook)
    throw new ApiError(500, "Something Went Wrong while updating book");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBook, "Book Updated Successfully"));
});

const updateCoverImage = asyncHander(async (req, res) => {
  const bookId = req.params.id;

  if (!bookId) throw new ApiError(400, "Invalid book id");

  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) throw new ApiError(400, "Cover image is missing");

  const book = await Book.findById(bookId);

  if (!book) throw new ApiError(400, "Book Not Found!");

  await deleteFromCloudinary(book.coverImage.public_id);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  book.coverImage = coverImage;
  const result = await book.save();
  console.log("result :", result);

  return res
    .status(204)
    .json(new ApiError(204, "Cover Image updated successfully"));
});

const publishBook = asyncHander(async (req, res) => {
  const bookId = req.params.id;

  if (!bookId) throw new ApiError(400, "Invalid BookID");

  const bookToBePublished = await Book.findByIdAndUpdate(bookId, {
    status: "published",
  });

  if (!bookToBePublished)
    throw new ApiError(400, "Something Went Wrong While Publishing book");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Book Published Successfully"));
});

const deleteBook = asyncHander(async (req, res) => {
  const bookId = req.params.id;
  const author_id = req.author._id;

  if (!bookId) throw new ApiError(400, "Invalid BookId");

  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found!");

  await deleteFromCloudinary(book.coverImage.public_id);

  await Book.findByIdAndDelete(bookId);

  await Author.findOneAndUpdate(author_id, {
    $pull: { books: bookId },
  });

  return res
    .status(204)
    .json(new ApiResponse(204, {}, "book deleted successfully"));
});

const getBookById = asyncHander(async (req, res) => {
  const bookId = req.params.id;
  if (!bookId) throw new ApiError(400, "Invalid Book Id");

  const book = await Book.findById(bookId).populate("ratings");

  if (!book) throw new ApiError(404, "Book Not Found!");

  return res
    .status(200)
    .json(new ApiResponse(200, book, "Book Fetched Successfully"));
});

const getAllBooks = asyncHander(async (req, res) => {
  const books = await Book.find().populate("ratings");

  return res
    .status(200)
    .json(new ApiResponse(200, books, "all books fetched successfully"));
});

export {
  addBook,
  updateBookDetails,
  publishBook,
  updateCoverImage,
  deleteBook,
  getBookById,
  getAllBooks,
};
