"use client";

import {
  AccessRoleTypes,
  GallerySchemaTypes,
  IndividualSchemaTypes,
  AccountAdminSchemaTypes,
  ArtistSchemaTypes,
} from "@omenai/shared-types";
import { useMemo, useCallback } from "react";
import { auth_uri } from "@omenai/url-config/src/config";
import { useRouter } from "next/navigation";
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";

type UserRole = AccessRoleTypes;

type SessionDataType = (
  | ({ role: "gallery" } & Omit<GallerySchemaTypes, "password">)
  | ({ role: "user" } & Omit<IndividualSchemaTypes, "password">)
  | ({ role: "admin" } & Omit<AccountAdminSchemaTypes, "password">)
  | ({ role: "artist" } & Omit<
      ArtistSchemaTypes,
      "password" | "art_style" | "documentation"
    >)
) & { id: string };

interface UseAuthOptions<T extends UserRole | undefined = undefined> {
  requiredRole?: T;
  redirectUrl?: string;
}

type AuthReturn<T extends UserRole | undefined> = {
  status: "authenticated" | "loading" | "unauthenticated" | "role_mismatch";
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRequiredRole: boolean;
  user: T extends "gallery"
    ? { role: "gallery" } & Omit<GallerySchemaTypes, "password"> & {
          id: string;
        }
    : T extends "user"
      ? { role: "user" } & Omit<IndividualSchemaTypes, "password"> & {
            id: string;
          }
      : T extends "admin"
        ? { role: "admin" } & Omit<AccountAdminSchemaTypes, "password"> & {
              id: string;
            }
        : T extends "artist"
          ? { role: "artist" } & Omit<
              ArtistSchemaTypes,
              "password" | "art_style" | "documentation"
            > & { id: string }
          : SessionDataType | null;
  signOut: () => Promise<void>;
  getToken: ReturnType<typeof useClerkAuth>["getToken"];
};

export function useAuth<T extends UserRole | undefined = undefined>(
  options: UseAuthOptions<T> = {}
): AuthReturn<T> {
  const { requiredRole, redirectUrl = `${auth_uri()}/login` } = options;

  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut, getToken } = useClerkAuth();
  const router = useRouter();

  // Extract role from Clerk user metadata
  const role = useMemo(() => {
    if (!clerkUser?.publicMetadata?.role) return undefined;
    return clerkUser.publicMetadata.role as UserRole;
  }, [clerkUser?.publicMetadata?.role]);

  // Create typed user object based on role
  const authUser = useMemo(() => {
    if (!clerkUser || !isLoaded || !clerkUser.id || !role) {
      return null;
    }

    const baseUser = {
      id: clerkUser.id,
      role: role,
      ...clerkUser.publicMetadata,
    };

    // Type-safe user object creation based on role
    switch (role) {
      case "gallery":
        return baseUser as { role: "gallery" } & Omit<
          GallerySchemaTypes,
          "password"
        > & { id: string };
      case "user":
        return baseUser as { role: "user" } & Omit<
          IndividualSchemaTypes,
          "password"
        > & { id: string };
      case "admin":
        return baseUser as { role: "admin" } & Omit<
          AccountAdminSchemaTypes,
          "password"
        > & { id: string };
      case "artist":
        return baseUser as { role: "artist" } & Omit<
          ArtistSchemaTypes,
          "password" | "art_style" | "documentation"
        > & { id: string };
      default:
        return baseUser as SessionDataType;
    }
  }, [clerkUser, isLoaded, role]);

  // Compute authentication status
  const isAuthenticated = useMemo(() => {
    return isLoaded && !!authUser && !!role;
  }, [isLoaded, authUser, role]);

  const isLoading = !isLoaded;

  // Check if user has required role
  const hasRequiredRole = useMemo(() => {
    if (!requiredRole) return true; // No role requirement
    return role === requiredRole;
  }, [role, requiredRole]);

  // Compute overall status
  const status = useMemo(() => {
    if (isLoading) return "loading" as const;
    if (!isAuthenticated) return "unauthenticated" as const;
    if (!hasRequiredRole) return "role_mismatch" as const;
    return "authenticated" as const;
  }, [isLoading, isAuthenticated, hasRequiredRole]);

  // Sign out function (only redirect that remains)
  const handleSignOut = useCallback(async () => {
    try {
      await clerkSignOut();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback redirect even if sign out fails
      window.location.href = redirectUrl;
    }
  }, [clerkSignOut, redirectUrl]);

  return {
    status,
    isAuthenticated,
    isLoading,
    hasRequiredRole,
    user: authUser as AuthReturn<T>["user"],
    signOut: handleSignOut,
    getToken,
  };
}

// Convenience hooks with specific role types
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

// Type guards for additional type safety
export const isGalleryUser = (
  user: SessionDataType | null
): user is { role: "gallery" } & Omit<GallerySchemaTypes, "password"> & {
    id: string;
  } => user?.role === "gallery";

export const isIndividualUser = (
  user: SessionDataType | null
): user is { role: "user" } & Omit<IndividualSchemaTypes, "password"> & {
    id: string;
  } => user?.role === "user";

export const isAdminUser = (
  user: SessionDataType | null
): user is { role: "admin" } & Omit<AccountAdminSchemaTypes, "password"> & {
    id: string;
  } => user?.role === "admin";

export const isArtistUser = (
  user: SessionDataType | null
): user is { role: "artist" } & Omit<
  ArtistSchemaTypes,
  "password" | "art_style" | "documentation"
> & { id: string } => user?.role === "artist";
