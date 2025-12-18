import User from "../db/models/User.js";
import Post from "../db/models/Post.js";
import HttpError from "../utils/HttpError.js";

export const getProfileDataByUserId = async (userId: string, viewerId: string | null = null) => {
  const foundUser = await User.findById(userId).select("-password -accessToken -refreshToken");

  if (!foundUser) {
    throw HttpError(404, "User not found");
  }

  const foundPosts = await Post.find({ author: foundUser._id })
    .select("_id imageUrl createdAt")
    .sort({ createdAt: -1 });

  const isFollowing =
    viewerId && Array.isArray(foundUser.followers)
      ? foundUser.followers.some((id) => String(id) === String(viewerId))
      : false;

  const responseData = {
    user: {
      _id: foundUser._id,
      username: foundUser.username,
      fullname: foundUser.fullname,
      email: foundUser.email,
      website: foundUser.profile?.website || "",
      about: foundUser.profile?.about || "",
      avatar: foundUser.profile?.avatar || "",
    },
    stats: {
      posts: foundPosts.length,
      followers: foundUser.followers?.length || 0,
      following: foundUser.following?.length || 0,
    },
    posts: foundPosts,
    isFollowing,
  };

  return responseData;
};

export const updateMyProfileByUserId = async (
  userId: string,
  dataFromFrontend: {
    username?: string;
    fullname?: string;
    website?: string;
    about?: string;
    avatar?: string;
  }
) => {
  const updateData: any = {};

  if (dataFromFrontend.username !== undefined) updateData.username = dataFromFrontend.username;
  if (dataFromFrontend.fullname !== undefined) updateData.fullname = dataFromFrontend.fullname;

  if (dataFromFrontend.website !== undefined) updateData["profile.website"] = dataFromFrontend.website;
  if (dataFromFrontend.about !== undefined) updateData["profile.about"] = dataFromFrontend.about;

  if (dataFromFrontend.avatar !== undefined) updateData["profile.avatar"] = dataFromFrontend.avatar;

  if (Object.keys(updateData).length === 0) throw HttpError(400, "No data to update");

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password -accessToken -refreshToken");

  if (!updatedUser) throw HttpError(404, "User not found");

  return {
    user: {
      _id: updatedUser._id,
      username: updatedUser.username,
      fullname: updatedUser.fullname,
      email: updatedUser.email,
      website: updatedUser.profile?.website || "",
      about: updatedUser.profile?.about || "",
      avatar: updatedUser.profile?.avatar || "",
    },
  };
};

export const searchUsers = async (search: string) => {
  const regex = new RegExp(search, "i");

  const users = await User.find({
    $or: [{ username: regex }, { fullname: regex }],
  })
    .select("_id username fullname profile.avatar")
    .limit(20)
    .lean();

  return users;
};


export const toggleFollowByUserIds = async (myId: string, targetId: string) => {
  if (String(myId) === String(targetId)) {
    throw HttpError(400, "You cannot follow yourself");
  }

  const me = await User.findById(myId);
  const target = await User.findById(targetId);

  if (!me || !target) {
    throw HttpError(404, "User not found");
  }

  const alreadyFollowing = me.following?.some((id) => String(id) === String(targetId));

  if (alreadyFollowing) {
    me.following.pull(targetId);
    target.followers.pull(myId);
  } else {
    me.following.addToSet(targetId);
    target.followers.addToSet(myId);
  }

  await me.save();
  await target.save();

  return {
    isFollowing: !alreadyFollowing,
    followersCount: target.followers.length,
    followingCount: target.following.length,
  };
};