"use server";

import { UserType } from "@omenai/shared-types";
import { getSession } from "@omenai/shared-auth/lib/auth/session";
export const checkSession = async (): Promise<boolean> => {
  const session: UserType | undefined = await getSession();

  return session === undefined ? false : true;
};

export const getServerSession = async (): Promise<UserType | undefined> => {
  const session: UserType | undefined = await getSession();
  return session;
};
