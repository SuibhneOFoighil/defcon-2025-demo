"use client"

import { useState, use } from "react"
import { Trash2, UserPlus, Server } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GroupDetailView } from "@/components/admin/group-detail-view"
import { DeleteGroupModal } from "@/components/admin/modals/delete-group-modal"
import { AddUsersToGroupModal } from "@/components/admin/modals/add-users-to-group-modal"
import { AddRangesToGroupModal } from "@/components/admin/modals/add-ranges-to-group-modal"
import { PageHeader } from "@/components/layout/page-header"
import { toast } from "sonner"
import { useGroupDetails } from "@/hooks/use-group-details"
import { useAdminData } from "@/hooks/use-admin-data"
import { addUserToGroup } from "@/lib/api/ludus/groups"

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddUsersModalOpen, setIsAddUsersModalOpen] = useState(false)
  const [isAddRangesModalOpen, setIsAddRangesModalOpen] = useState(false)
  
  // Use the hook to fetch group details
  const { group, admins, members, loading: isLoading, error, invalidateGroupMembers } = useGroupDetails(resolvedParams.id)

  
  // Get all users to show available ones for adding
  const { users } = useAdminData()
  
  // Filter users that are not already in the group
  const currentMemberIds = new Set([...admins.map(a => a.userID), ...members.map(m => m.userID)])
  const availableUsers = users.filter(user => !currentMemberIds.has(user.userID))

  const handleDeleteGroup = () => {
    setIsDeleteModalOpen(true)
  }


  const handleAddUsers = () => {
    setIsAddUsersModalOpen(true)
  }

  const handleAddRanges = () => {
    setIsAddRangesModalOpen(true)
  }


  const handleAddUsersConfirm = async (selectedUserIds: string[]) => {
    if (!group) return;
    
    try {
      // Add each user to the group
      await Promise.all(
        selectedUserIds.map(userId => addUserToGroup(resolvedParams.id, userId))
      );
      
      // Refresh the group members data
      await invalidateGroupMembers();
      
      toast.success("Users added", {
        description: `${selectedUserIds.length} user(s) have been added to ${group.name}.`,
      });
    } catch (error) {
      toast.error("Failed to add users", {
        description: error instanceof Error ? error.message : "An error occurred while adding users to the group.",
      });
    }
  }

  const handleBack = () => {
    router.push("/admin/groups")
  }

  if (error) {
    return (
      <>
        <PageHeader 
          title="Error loading group"
          showBackButton
          onBackClick={handleBack}
        />
        <div className="flex-1 p-6 overflow-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-destructive mb-2">Error loading group details</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </>
    )
  }

  if (isLoading || !group) {
    return (
      <>
        <PageHeader 
          title="Loading..."
          showBackButton
          onBackClick={handleBack}
        />
        <div className="flex-1 p-6 overflow-auto animate-pulse">
          <div className="h-6 bg-muted rounded w-1/6 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader 
        title={group.name}
        titleSuffix={
          <Badge variant="secondary" size="sm">
            {admins.length + members.length} Members
          </Badge>
        }
        showBackButton
        onBackClick={handleBack}
      >
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 text-red-500 border-red-500 hover:bg-red-500/10"
          onClick={handleDeleteGroup}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Group</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleAddRanges}
        >
          <Server className="h-3.5 w-3.5" />
          <span>Add Ranges</span>
        </Button>

        <Button 
          variant="elevated" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={handleAddUsers}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Add Users</span>
        </Button>
        
        {/* Separator */}
        <div className="h-6 w-px bg-border"></div>
      </PageHeader>

      {/* Main Content */}
      <GroupDetailView groupId={resolvedParams.id} />

      {/* Modals */}
      <DeleteGroupModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        group={group}
        onSuccess={() => router.push("/admin/groups")}
      />


      <AddUsersToGroupModal
        open={isAddUsersModalOpen}
        onClose={() => setIsAddUsersModalOpen(false)}
        onConfirm={handleAddUsersConfirm}
        targetGroups={group ? [{ id: group.id, name: group.name }] : []}
        availableUsers={availableUsers}
      />

      <AddRangesToGroupModal
        open={isAddRangesModalOpen}
        onClose={() => setIsAddRangesModalOpen(false)}
        groupId={resolvedParams.id}
        groupName={group?.name || ""}
      />
    </>
  )
}
