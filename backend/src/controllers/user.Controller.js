import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHander } from "../utils/asyncHandler.js";

import { User } from "../models/user.Model.js";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (id) => {
  try {
    const user = await User.findById(id);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong while generating the access and refresh token",
      error
    );
  }
};

const registerUser = asyncHander(async (req, res) => {
  const { email, username, password, fullName } = req.body;

  if (
    [email, username, password, fullName].some(
      (field) => field === undefined || field === null || field.trim() === ""
    )
  ) {
    throw new ApiError(
      400,
      "Please Enter email,username and password correctly"
    );
  }

  const existedUser = await User.findOne({
    $or: { email, username },
  });

  if (existedUser) {
    console.log(existedUser);
    throw new ApiError(400, "User already exist with this username or email");
  }

  const user = await User.create({
    username,
    email,
    password,
    fullName,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser)
    throw new ApiError(500, "Something Went Wrong While registring the user");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully!"));
});

const loginUser = asyncHander(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username))
    throw new ApiError(400, "Email or Username is required for login");

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) throw new ApiError(404, "User not Found!");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!");
  }

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    loggedInUser._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { loggedInUser, accessToken, refreshToken },
        "User loggedIn succesffuly"
      )
    );
});

const updateUserDetails = asyncHander(async (req, res) => {
  const { email, username, fullName } = req.body;
  const userId = req.user._id;

  if (
    [email, username, fullName].some(
      (field) => field === undefined || field === null || field.trim() === ""
    )
  )
    throw new ApiError(
      400,
      "Please enter valid Email and Username is required to Update"
    );

  const updatedUser = await User.findOneAndUpdate(
    userId,
    {
      email,
      username,
      fullName,
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!updatedUser)
    throw new ApiError(500, "Something Went Wrong While Updating User details");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

export { registerUser, loginUser, updateUserDetails };
