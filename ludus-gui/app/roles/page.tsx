"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { RolesViewer } from "@/components/roles/roles-viewer"
import { SearchBar } from "@/components/ui/search-bar"
import { Button } from "@/components/ui/button"
import { InstallRoleWizard } from "@/components/wizards/install-role-wizard"
import { useAnsibleData } from "@/hooks/use-ansible-data"
import { Plus } from "lucide-react"
import { ComponentsPageSkeleton } from "@/components/components-page-skeleton"
import { AnsibleItem } from "@/lib/types/ansible"
import { getAnsibleGalaxyUrl } from "@/lib/utils/ansible"

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showInstallWizard, setShowInstallWizard] = useState(false)
  const { items, loading, error } = useAnsibleData()

  // Filter roles based on search
  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase()
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.type?.toLowerCase().includes(searchLower) ||
      item.version?.toLowerCase().includes(searchLower)
    )
  })

  const handleViewDetails = (item: AnsibleItem) => {
    const url = getAnsibleGalaxyUrl(item.name, item.type as 'role' | 'collection')
    window.open(url, '_blank')
  }

  return (
    <>
      <PageHeader title="Ansible Roles" />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {loading ? (
            <ComponentsPageSkeleton />
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-red-500">Error loading roles: {error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search roles and collections..."
                  className="max-w-md"
                />
                <Button
                  onClick={() => setShowInstallWizard(true)}
                  variant="elevated"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Install Role
                </Button>
              </div>

              {/* Roles Content */}
              <RolesViewer
                data={filteredItems}
                isLoading={loading}
                enablePagination={false}
                onViewDetails={handleViewDetails}
              />
            </div>
          )}
        </div>
      </main>

      {/* Wizards */}
      <InstallRoleWizard
        open={showInstallWizard}
        onOpenChange={setShowInstallWizard}
      />
    </>
  )
}