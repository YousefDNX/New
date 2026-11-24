import { useQuery } from "@tanstack/react-query";
import { useOptionalAuth } from "@/lib/auth.tsx";
import { fetchUserStaffRole, FOUNDER_EMAIL, type StaffRoleType } from "@/lib/support-service";

export interface RbacPermissions {
  role: StaffRoleType;
  isFounder: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  canManageTickets: boolean;
  canModerate: boolean;
  canManageHelp: boolean;
  canManageUsers: boolean;
  canManageStaff: boolean;
  loading: boolean;
}

export function useRbac(): RbacPermissions {
  const auth = useOptionalAuth();
  const user = auth?.user ?? null;
  const isInitialized = auth?.isInitialized ?? false;

  const isFounderEmail = Boolean(
    user?.emailVerified && user?.email && user.email.toLowerCase() === FOUNDER_EMAIL.toLowerCase(),
  );

  const { data: role = isFounderEmail ? "founder" : "student", isLoading } = useQuery({
    queryKey: ["staff-role", user?.uid],
    queryFn: async (): Promise<StaffRoleType> => {
      if (!user) return "student";
      return await fetchUserStaffRole(user.uid, user.email);
    },
    enabled: Boolean(user && isInitialized),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const effectiveRole: StaffRoleType = isFounderEmail ? "founder" : role;
  const isFounder = effectiveRole === "founder";
  const isAdmin = isFounder || effectiveRole === "admin";
  const isStaff =
    isFounder ||
    effectiveRole === "admin" ||
    effectiveRole === "support" ||
    effectiveRole === "moderator" ||
    effectiveRole === "content_manager";

  return {
    role: effectiveRole,
    isFounder,
    isAdmin,
    isStaff,
    canManageTickets:
      isStaff && (isFounder || effectiveRole === "admin" || effectiveRole === "support"),
    canModerate:
      isStaff && (isFounder || effectiveRole === "admin" || effectiveRole === "moderator"),
    canManageHelp:
      isStaff && (isFounder || effectiveRole === "admin" || effectiveRole === "content_manager"),
    canManageUsers: isAdmin,
    canManageStaff: isFounder,
    loading: isLoading,
  };
}
