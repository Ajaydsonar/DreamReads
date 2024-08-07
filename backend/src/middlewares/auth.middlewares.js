import jwt from "jsonwebtoken";
import { asyncHander } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Author } from "../models/author.Model.js";
import { User } from "../models/user.Model.js";

export const verifyJWT = asyncHander(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authrorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const author = await Author.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!author) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.author = author;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const verifyUserJWT = asyncHander(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authrorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
