import { Author } from "../models/author.Model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHander } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (id) => {
  try {
    const author = await Author.findById(id);

    const accessToken = author.generateAccessToken();
    const refreshToken = author.generateRefreshToken();

    author.refreshToken = refreshToken;
    await author.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong while generating the access and refresh token",
      error
    );
  }
};

const registerAuthor = asyncHander(async (req, res) => {
  // destructuring the body

  const { username, email, password, role } = req.body;

  if (
    [username, email, password].some(
      (field) => field.trim() === "" || field === (undefined || null)
    )
  ) {
    throw new ApiError(404, "Please Enter the Details Correctly");
  }

  const existedUser = await Author.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(400, "User already Exist With this Username or Email");
  }

  if (role !== "author") {
    throw new ApiError(400, "Please Enter Valid Role");
  }

  const avatarLocationPath = req.file?.path;
  console.log(avatarLocationPath);

  if (!avatarLocationPath) {
    throw new ApiError(400, "Please Provide Avatar");
  }

  const avatar = await uploadOnCloudinary(avatarLocationPath);

  const verificationToken = jwt.sign(
    { email, username },
    process.env.verificationTokenSecret
  );

  await sendVerificationEmail(email, verificationToken);

  const author = await Author.create({
    avatar: avatar.url,
    username,
    email,
    password,
    role,
    verificationToken,
  });

  const createdAuthor = await Author.findById(author._id).select(
    "-password -refreshToken"
  );

  if (!createdAuthor) {
    throw new ApiError(500, "Something Went Wrong While registring the Author");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdAuthor,
        "Author registered successfully verify Email before loging in"
      )
    );
});

const verifyEmail = asyncHander(async (req, res) => {
  const token = req.params.token;
  if (!token) throw new ApiError(400, "Invalid verification token");

  const author = await Author.findOne({ verificationToken: token });
  if (!author) throw new ApiError(400, "Invalid verification token");

  author.isVerified = true;
  author.verificationToken = undefined;
  await author.save();

  res.status(200).json(new ApiResponse(200, {}, "Email verified Successfully"));
});

const loginAuthor = asyncHander(async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    throw new ApiError(400, "Please Provide valid Email and Password");
  }

  const author = await Author.findOne({ email });

  if (!author) {
    throw new ApiError(404, "User not found with this email");
  }

  const isPasswordValid = await author.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!");
  }

  if (!author.isVerified)
    throw new ApiError(401, "Please verify email before login");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    author._id
  );

  const loggedInAuthor = await Author.findById(author._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInAuthor, accessToken, refreshToken },
        "User loggedIn SuccessFully"
      )
    );
});

const logoutAuthor = asyncHander(async (req, res) => {
  await Author.findByIdAndUpdate(
    req.author._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout Successfully!"));
});

const refreshAccessToken = asyncHander(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const author = await Author.findById(decodedToken._id);

    if (!author) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (incomingRefreshToken !== author?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(author._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export {
  registerAuthor,
  loginAuthor,
  logoutAuthor,
  refreshAccessToken,
  verifyEmail,
};
