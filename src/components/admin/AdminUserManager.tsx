import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  Crown,
  GraduationCap,
  School,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchAdminUserList,
  assignStaffRole,
  revokeStaffRole,
  type AdminUserRecord,
  type StaffRoleType,
  FOUNDER_EMAIL,
} from "@/lib/support-service";
import { useRbac } from "@/hooks/use-rbac";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function AdminUserManager() {
  const rbac = useRbac();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Role Assignment Modal state
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [targetRole, setTargetRole] = useState<StaffRoleType>("student");
  const [submittingRole, setSubmittingRole] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUserList();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load user list:", err);
      toast.error("Could not retrieve user directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.schoolName && u.schoolName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenRoleModal = (u: AdminUserRecord) => {
    setSelectedUser(u);
    setTargetRole(u.role);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !currentUser) return;
    if (selectedUser.isFounder) {
      toast.error("Founder super-administrative role cannot be modified.");
      return;
    }

    setSubmittingRole(true);
    try {
      const actor = {
        uid: currentUser.uid,
        email: currentUser.email || FOUNDER_EMAIL,
        role: rbac.role,
      };

      if (targetRole === "student") {
        await revokeStaffRole(selectedUser.uid, actor, selectedUser.email);
        toast.success(`Role for ${selectedUser.displayName} updated to Student.`);
      } else {
        await assignStaffRole(selectedUser.uid, selectedUser.email, targetRole, actor);
        toast.success(`Role for ${selectedUser.displayName} updated to ${targetRole}.`);
      }

      setUsers((prev) =>
        prev.map((item) => (item.uid === selectedUser.uid ? { ...item, role: targetRole } : item)),
      );
      setSelectedUser(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change user role.");
    } finally {
      setSubmittingRole(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Student &amp; Staff Directory
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inspect registered accounts, view grade profiles, and manage role-based staff
            assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={loading}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="size-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, school, or UID..."
            className="ps-9 text-xs h-9"
          />
        </div>

        <div className="w-44">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="text-xs h-9">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles ({users.length})</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="support">Support Staff</SelectItem>
              <SelectItem value="moderator">Moderators</SelectItem>
              <SelectItem value="content_manager">Content Managers</SelectItem>
              <SelectItem value="admin">Administrators</SelectItem>
              <SelectItem value="founder">Founder</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table / Card List */}
      {loading ? (
        <div className="surface-card p-12 text-center text-xs text-muted-foreground">
          Loading user records...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="surface-card p-8 text-center text-xs text-muted-foreground">
          No users match the search criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => {
            const isFounder = u.isFounder || u.role === "founder";
            return (
              <div
                key={u.uid}
                className={`surface-card p-4 space-y-3 transition-all ${
                  isFounder ? "border-amber-500/40 bg-amber-500/5" : ""
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {u.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">
                          {u.displayName}
                        </span>
                        {isFounder && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1"
                          >
                            <Crown className="size-3" />
                            Founder
                          </Badge>
                        )}
                        {!isFounder && u.role !== "student" && (
                          <Badge variant="outline" className="text-[10px] capitalize text-primary">
                            {u.role.replace("_", " ")}
                          </Badge>
                        )}
                        {u.role === "student" && (
                          <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                            Student
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="size-3" />
                          {u.email}
                        </span>
                        <span className="text-border">·</span>
                        <span className="font-mono text-[10px] text-muted-foreground/70">
                          {u.uid.slice(0, 10)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {rbac.canManageStaff && !isFounder && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRoleModal(u)}
                        className="h-7 text-xs gap-1.5"
                      >
                        <Shield className="size-3" />
                        <span>Manage Role</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Academic Profile Details */}
                {(u.gradeLevel ||
                  u.schoolName ||
                  (u.preferredSubjects && u.preferredSubjects.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                    {u.gradeLevel && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="size-3 text-primary" />
                        {u.gradeLevel}
                      </span>
                    )}
                    {u.schoolName && (
                      <span className="flex items-center gap-1">
                        <School className="size-3 text-primary" />
                        {u.schoolName}
                      </span>
                    )}
                    {u.preferredSubjects && u.preferredSubjects.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-muted-foreground/80">
                          Subjects:
                        </span>
                        {u.preferredSubjects.slice(0, 3).map((sub) => (
                          <span
                            key={sub}
                            className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px]"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Role Assignment Dialog */}
      {selectedUser && (
        <Dialog
          open={Boolean(selectedUser)}
          onOpenChange={(open) => !open && setSelectedUser(null)}
        >
          <DialogContent className="sm:max-w-md bg-surface border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display text-foreground">
                <ShieldCheck className="size-5 text-primary" />
                Manage Staff Role &amp; Permissions
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update access tier for{" "}
                <span className="font-semibold text-foreground">{selectedUser.displayName}</span> (
                {selectedUser.email}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-lg bg-surface-2 border border-border text-xs space-y-1">
                <div className="font-semibold text-foreground">Current Access Level:</div>
                <div className="text-muted-foreground capitalize">
                  {selectedUser.role.replace("_", " ")}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Select New Role</label>
                <Select
                  value={targetRole}
                  onValueChange={(val) => setTargetRole(val as StaffRoleType)}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student (Standard user)</SelectItem>
                    <SelectItem value="support">Support Agent (Respond to tickets)</SelectItem>
                    <SelectItem value="moderator">Moderator (Review safety reports)</SelectItem>
                    <SelectItem value="content_manager">
                      Content Manager (Edit help docs)
                    </SelectItem>
                    <SelectItem value="admin">
                      Administrator (Manage users &amp; settings)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-muted-foreground flex items-start gap-2">
                <Lock className="size-3.5 text-primary mt-0.5 shrink-0" />
                <span>
                  All role modifications are immutably logged to the administrative audit trail with
                  actor identity and timestamp.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="glow"
                  size="sm"
                  onClick={handleSaveRole}
                  disabled={submittingRole}
                >
                  <span>{submittingRole ? "Updating..." : "Confirm Role Change"}</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
