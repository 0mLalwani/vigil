import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { UserModel } from "../models/User";
import { clerkClient, getAuth } from "@clerk/express";

export async function whoAmI(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req;
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    res.status(200).json(user);
    return;
  } catch (err) {
    res.status(500);
    next(err);
  }
}
/*
  A user will always exist on clerk first
  A synchronizing function is needed to createUser in MongoDB too
*/
export async function authCallback(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId: clerkId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (await UserModel.exists({ clerkId })) {
      res.status(200).json({ message: "Welcome" });
      return;
    }

    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const name =
      [clerkUser.firstName, clerkUser.lastName]
        .filter((value) => Boolean(value)) //checking for falsy/non-existant name parts
        .join(" ")
        .trim() ||
      clerkUser.username ||
      email?.split("@")[0] ||
      "New user";

    await UserModel.updateOne(
      { clerkId },
      {
        $setOnInsert: {
          email,
          name,
          avatar: clerkUser.imageUrl,
        },
      },
      { upsert: true, runValidators: true },
    );

    res.status(200).json({ message: "Created" });
    return;
  } catch (err) {
    res.status(500);
    next(err);
  }
}
