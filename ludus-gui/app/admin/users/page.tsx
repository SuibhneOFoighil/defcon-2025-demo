"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { useAdminData } from "@/hooks/use-admin-data"
import { UserGrid } from "@/components/admin/user-grid"
import { SearchBar } from "@/components/ui/search-bar"
import { CreateUserModal } from "@/components/admin/modals/create-user-modal"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  
  // Use the admin data hook
  const { users, loading, error } = useAdminData()

  const openCreateUserModal = () => {
    setIsCreateUserModalOpen(true)
  }

  const closeCreateUserModal = (open: boolean) => {
    setIsCreateUserModalOpen(open)
  }

  // Show error state
  if (error) {
    return (
      <>
        <PageHeader title="Users" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-destructive">Error loading user data</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Users" />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="space-y-4">
            {/* Header with search and action buttons */}
            <div className="flex items-center justify-between">
              <SearchBar
                placeholder="Search users..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="max-w-md"
              />
              <Button
                onClick={openCreateUserModal}
                variant="elevated"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
            
            <UserGrid 
              users={users}
              searchQuery={searchQuery} 
              isLoading={loading}
            />
          </div>
        </div>
      </main>

      <CreateUserModal open={isCreateUserModalOpen} onOpenChange={closeCreateUserModal} />
    </>
  )
}