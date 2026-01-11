"use client";
import { useMemo, useCallback } from "react";
import { auth_uri, base_url, getApiUrl } from "@omenai/url-config/src/config";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AccessRoleTypes,
  GallerySchemaTypes,
  IndividualSchemaTypes,
  AccountAdminSchemaTypes,
  ArtistSchemaTypes,
  SessionDataType,
  ClientSessionData,
} from "@omenai/shared-types";

import { useSessionContext } from "@omenai/package-provider";
import { useSession } from "./useSession";

// Define the type for the data fetched from /api/session

type UserRole = AccessRoleTypes;

interface UseAuthOptions<T extends UserRole | undefined = undefined> {
  requiredRole?: T;
  redirectUrl?: string;
  // New option for initial session data from SSR
  initialSessionData?: ClientSessionData;
}

type AuthReturn<T extends UserRole | undefined> = {
  status: "authenticated" | "loading" | "unauthenticated" | "role_mismatch";
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRequiredRole: boolean;
  user: T extends "gallery"
    ? { role: "gallery" } & Omit<
        GallerySchemaTypes,
        "password" | "phone" | "clerkUserId"
      > & { id: string }
    : T extends "user"
      ? { role: "user" } & Omit<
          IndividualSchemaTypes,
          "password" | "phone" | "clerkUserId"
        > & { id: string }
      : T extends "admin"
        ? { role: "admin" } & Omit<
            AccountAdminSchemaTypes,
            "password" | "phone" | "clerkUserId"
          > & { id: string }
        : T extends "artist"
          ? { role: "artist" } & Omit<
              ArtistSchemaTypes,
              | "password"
              | "phone"
              | "clerkUserId"
              | "art_style"
              | "documentation"
            > & { id: string }
          : SessionDataType | null;
  signOut: (shouldRedirect?: boolean) => Promise<void>;
  csrf: string | undefined;
};

// Function to fetch session data from your API route

export function useAuth<T extends UserRole | undefined = undefined>(
  options: UseAuthOptions<T> = {}
): AuthReturn<T> {
  const { requiredRole, redirectUrl = `${auth_uri()}/login` } = options;
  const queryClient = useQueryClient();

  const { initialSessionData: contextSessionData } = useSessionContext();
  const serverSessionData = contextSessionData;

  const { sessionData, isLoadingQuery, isPending } = useSession({
    initialData: serverSessionData,
  });

  // Determine authentication status based on fetched data
  const isLoggedIn = sessionData?.isLoggedIn === true;

  // Loading state management with initial data consideration
  const isLoading = useMemo(() => {
    // If we have initial data, we're not loading
    if (serverSessionData) return false;
    return isLoadingQuery || isPending;
  }, [isLoadingQuery, isPending, serverSessionData]);

  // Extract role and id from the fetched session data
  const role = useMemo(() => {
    return sessionData?.isLoggedIn ? sessionData.user?.role : undefined;
  }, [sessionData?.isLoggedIn, sessionData?.user?.role]);

  const id = useMemo(() => {
    return sessionData?.isLoggedIn ? sessionData.user?.id : undefined;
  }, [sessionData?.isLoggedIn, sessionData?.user]);

  // Create typed user object based on role from fetched data
  const authUser = useMemo(() => {
    if (!id || !role || !isLoggedIn) {
      return null;
    }

    const baseUser = {
      id: id,
      role: role,
      ...sessionData,
    };

    switch (role) {
      case "gallery":
        return baseUser.user as { role: "gallery" } & Omit<
          GallerySchemaTypes,
          "password" | "phone" | "clerkUserId"
        > & { id: string };
      case "user":
        return baseUser.user as { role: "user" } & Omit<
          IndividualSchemaTypes,
          "password" | "phone" | "clerkUserId"
        > & { id: string };
      case "admin":
        return baseUser.user as { role: "admin" } & Omit<
          AccountAdminSchemaTypes,
          "password" | "phone" | "clerkUserId"
        > & { id: string };
      case "artist":
        return baseUser.user as { role: "artist" } & Omit<
          ArtistSchemaTypes,
          "password" | "phone" | "clerkUserId" | "art_style" | "documentation"
        > & { id: string };
      default:
        return baseUser.user as SessionDataType;
    }
  }, [id, role, isLoggedIn, sessionData]);

  // Check if user has required role
  const hasRequiredRole = useMemo(() => {
    if (!requiredRole) return true;
    return role === requiredRole;
  }, [role, requiredRole]);

  // Compute overall status
  const status = useMemo(() => {
    if (isLoading) return "loading" as const;
    if (!isLoggedIn) return "unauthenticated" as const;
    if (!hasRequiredRole) return "role_mismatch" as const;
    return "authenticated" as const;
  }, [isLoading, isLoggedIn, hasRequiredRole]);

  // Sign out function
  const handleSignOut = useCallback(
    async (shouldRedirect = true) => {
      try {
        const res = await fetch(`${getApiUrl()}/api/auth/session/logout`, {
          method: "POST",
          headers: {
            Origin: base_url(),
          },
          credentials: "include",
        });
        if (!res.ok) {
          console.error("Failed to sign out on server:", await res.text());
        }
        queryClient.removeQueries({ queryKey: ["session"] });
        queryClient.invalidateQueries({ queryKey: ["session"] });
        if (shouldRedirect) {
          window.location.href = redirectUrl;
        }
      } catch (error) {
        console.error("Sign out error:", error);

        if (shouldRedirect) {
          window.location.href = redirectUrl;
        }
      }
    },
    [redirectUrl, queryClient]
  );

  return {
    status,
    isAuthenticated: isLoggedIn,
    isLoading,
    hasRequiredRole,
    user: authUser as AuthReturn<T>["user"],
    signOut: handleSignOut,
    csrf: sessionData?.csrfToken,
  };
}

// Enhanced convenience hooks with SSR support
export const useGalleryAuth = (
  options: Omit<UseAuthOptions<"gallery">, "requiredRole"> = {}
) => useAuth<"gallery">({ ...options, requiredRole: "gallery" });

export const useUserAuth = (
  options: Omit<UseAuthOptions<"user">, "requiredRole"> = {}
) => useAuth<"user">({ ...options, requiredRole: "user" });

export const useAdminAuth = (
  options: Omit<UseAuthOptions<"admin">, "requiredRole"> = {}
) => useAuth<"admin">({ ...options, requiredRole: "admin" });

export const useArtistAuth = (
  options: Omit<UseAuthOptions<"artist">, "requiredRole"> = {}
) => useAuth<"artist">({ ...options, requiredRole: "artist" });

// Type guards remain the same
export const isGalleryUser = (
  user: SessionDataType | null
): user is { role: "gallery" } & Omit<
  GallerySchemaTypes,
  "password" | "phone" | "clerkUserId"
> & {
    id: string;
  } => user?.role === "gallery";

export const isIndividualUser = (
  user: SessionDataType | null
): user is { role: "user" } & Omit<
  IndividualSchemaTypes,
  "password" | "phone" | "clerkUserId"
> & {
    id: string;
  } => user?.role === "user";

export const isAdminUser = (
  user: SessionDataType | null
): user is { role: "admin" } & Omit<
  AccountAdminSchemaTypes,
  "password" | "phone" | "clerkUserId"
> & {
    id: string;
  } => user?.role === "admin";

export const isArtistUser = (
  user: SessionDataType | null
): user is { role: "artist" } & Omit<
  ArtistSchemaTypes,
  "password" | "phone" | "clerkUserId" | "art_style" | "documentation"
> & { id: string } => user?.role === "artist";
