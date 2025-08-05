"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { useAdminData } from "@/hooks/use-admin-data"
import { SearchBar } from "@/components/ui/search-bar"
import { GroupGrid } from "@/components/admin/group-grid"
import { CreateGroupModal } from "@/components/admin/modals/create-group-modal"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)

  // Use the admin data hook
  const { groups, loading, error } = useAdminData()

  const openCreateGroupModal = () => {
    setIsCreateGroupModalOpen(true)
  }

  const closeCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false)
  }

  // Show error state
  if (error) {
    return (
      <>
        <PageHeader title="Groups" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-destructive">Error loading group data</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Groups" />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="space-y-4">
            {/* Header with search and action buttons */}
            <div className="flex items-center justify-between">
              <SearchBar
                placeholder="Search groups..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="max-w-md"
              />
              <Button
                onClick={openCreateGroupModal}
                variant="elevated"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </div>
            
            <GroupGrid 
              groups={groups}
              searchQuery={searchQuery}
              isLoading={loading}
            />
          </div>
        </div>
      </main>

      <CreateGroupModal open={isCreateGroupModalOpen} onOpenChange={closeCreateGroupModal} />
    </>
  )
}