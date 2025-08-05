"use client"

import { useState } from "react"
import { Trash2, Key, Share2, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ResourceCard } from "./resource-card"
import { GroupCard } from "./group-card"
import { RangeCard } from "./range-card"
import { TemplateCard } from "./template-card"
import { TwoRowHeader } from "@/components/layout/two-row-header"
import { NotificationPanel } from "@/components/notifications/notification-panel"
import { DeleteUserModal } from "./modals/delete-user-modal"
import { ResetPasswordModal } from "./modals/reset-password-modal"
import { SharePasswordModal } from "./modals/share-password-modal"
import { AddToGroupModal } from "./modals/add-to-group-modal"
import { toast } from "sonner"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { NotificationBell } from "@/components/notifications/notification-bell"

// Types for user detail view
export interface UserGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

export interface UserRange {
  id: string;
  title: string;
  status: "running" | "error" | "deployed";
  resources: {
    cpus: number;
    ram: number;
    disk: number;
  };
  lastUsed: string;
  image?: string;
}

export interface UserTemplate {
  id: string;
  title: string;
  status: "draft" | "published";
  lastEdited: string;
  image?: string;
}

export interface UserDetail {
  id: string;
  name: string;
  userId: string;
  email: string;
  role: string;
  resources: {
    cpus: number;
    ram: number;
    disk: number;
  };
  groups: UserGroup[];
  ranges: UserRange[];
  templates: UserTemplate[];
}

interface UserDetailViewProps {
  user: UserDetail;
  onBack: () => void;
}

export function UserDetailView({ user, onBack }: UserDetailViewProps) {
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)
  const [isSharePasswordModalOpen, setIsSharePasswordModalOpen] = useState(false)
  const [isAddToGroupModalOpen, setIsAddToGroupModalOpen] = useState(false)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)

  // Available groups for the add to group modal
  // In a real app, this would come from an API or context
  const availableGroups = [
    { id: "group-1", name: "Cyber Defense Squad" },
    { id: "group-2", name: "Red Team" },
    { id: "group-3", name: "Blue Team" },
    { id: "group-4", name: "Security Operations" },
    { id: "group-5", name: "Incident Response" },
    { id: "group-6", name: "Threat Intelligence" },
    { id: "group-7", name: "Vulnerability Management" },
    { id: "group-8", name: "Security Architecture" },
  ]

  // Modal handlers
  const handleDeleteUser = () => {
    setIsDeleteModalOpen(true)
  }

  const handleResetPassword = () => {
    setIsResetPasswordModalOpen(true)
  }

  const handleSharePassword = () => {
    setIsSharePasswordModalOpen(true)
  }

  const handleAddToGroup = () => {
    setIsAddToGroupModalOpen(true)
  }

  // Modal confirmation handlers
  const handleConfirmDelete = () => {
    // In a real app, this would call an API
    console.log("Deleting user:", user.id)
    toast.error("User deleted", {
      description: `${user.name} has been deleted successfully.`,
    })
    // Typically would redirect back to the users list
    onBack()
  }

  const handleConfirmResetPassword = (password: string, confirmPassword: string, sendEmail: boolean) => {
    // In a real app, this would call an API
    console.log("Resetting password for user:", user.id, { password, confirmPassword, sendEmail })
    toast("Password reset", {
      description: `Password for ${user.name} has been reset successfully.`,
    })
  }

  const handleConfirmSharePassword = () => {
    // In a real app, this would call an API
    console.log("Sharing password for user:", user.id)
    toast("Password shared", {
      description: `Temporary password has been sent to ${user.name}.`,
    })
  }

  const handleConfirmAddToGroup = (selectedGroups: string[]) => {
    // In a real app, this would call an API
    console.log("Adding user to groups:", user.id, selectedGroups)
    toast("User added to groups", {
      description: `${user.name} has been added to ${selectedGroups.length} group(s).`,
    })
  }

  return (
    <Sheet open={isNotificationPanelOpen} onOpenChange={setIsNotificationPanelOpen}>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header using TwoRowHeader component */}
        <TwoRowHeader 
          showBackButton 
          onBackClick={onBack}
          notificationBellSlot={ 
            <SheetTrigger asChild>
              <NotificationBell />
            </SheetTrigger>
          }
        >
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-medium">{user.name}</h1>
                <Badge variant={user.role === "manager" ? "info" : "danger"} size="sm">
                  {user.role === "manager" ? "Manager" : "Team Member"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/10"
                  onClick={handleDeleteUser}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete User</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-primary border-primary hover:bg-primary/10"
                  onClick={handleResetPassword}
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>Reset Password</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-primary border-primary hover:bg-primary/10"
                  onClick={handleSharePassword}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Password</span>
                </Button>

                <Button variant="elevated" size="sm" className="flex items-center gap-1" onClick={handleAddToGroup}>
                  <span>Add to Group</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col text-sm text-muted-foreground">
              <span>{user.userId}</span>
              <span>Email - {user.email}</span>
            </div>
          </div>
        </TwoRowHeader>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Resource Usage */}
          <section>
            <h2 className="text-lg font-medium mb-4">Resource Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ResourceCard
                title="Total CPUs"
                value={user.resources.cpus.toString()}
                icon={<Info className="h-4 w-4 text-primary" />}
              />
              <ResourceCard
                title="Total Allocated RAM"
                value={`${user.resources.ram} GB`}
                icon={<Info className="h-4 w-4 text-primary" />}
              />
              <ResourceCard
                title="Total Allocated Disk"
                value={`${user.resources.disk} GB`}
                icon={<Info className="h-4 w-4 text-primary" />}
              />
            </div>
          </section>

          {/* Groups */}
          <section>
            <h2 className="text-lg font-medium mb-4">Groups ({user.groups.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.groups.map((group: UserGroup) => (
                <GroupCard
                  key={group.id}
                  group={group}
                />
              ))}
            </div>
          </section>

          {/* Ranges Shared */}
          <section>
            <h2 className="text-lg font-medium mb-4">Ranges Shared ({user.ranges.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.ranges.map((range: UserRange) => (
                <RangeCard
                  key={range.id}
                  id={range.id}
                  title={range.title}
                  status={range.status}
                  resources={range.resources}
                  lastUsed={range.lastUsed}
                  image={range.image}
                />
              ))}
            </div>
          </section>

          {/* Templates Shared */}
          <section>
            <h2 className="text-lg font-medium mb-4">Templates Shared ({user.templates.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.templates.map((template: UserTemplate) => (
                <TemplateCard
                  key={template.id}
                  id={template.id}
                  title={template.title}
                  status={template.status}
                  lastEdited={template.lastEdited}
                  image={template.image}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Modals */}
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          userName={user.name}
        />

        <ResetPasswordModal
          isOpen={isResetPasswordModalOpen}
          onClose={() => setIsResetPasswordModalOpen(false)}
          onConfirm={handleConfirmResetPassword}
          userName={user.name}
        />

        <SharePasswordModal
          isOpen={isSharePasswordModalOpen}
          onClose={() => setIsSharePasswordModalOpen(false)}
          onConfirm={handleConfirmSharePassword}
          userName={user.name}
        />

        <AddToGroupModal
          open={isAddToGroupModalOpen}
          onClose={() => setIsAddToGroupModalOpen(false)}
          onConfirm={handleConfirmAddToGroup}
          selectedUsers={[user.id]} // Pass the current user ID
          availableGroups={availableGroups}
        />

        {/* Add NotificationPanel to make the notification bell functional */}
        <NotificationPanel />
      </div>
    </Sheet>
  )
}
