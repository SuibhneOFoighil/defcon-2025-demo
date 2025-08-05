"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { BlueprintsViewer } from "@/components/blueprints/blueprints-viewer"
import { SearchBar } from "@/components/ui/search-bar"
import { Button } from "@/components/ui/button"
import { CreateBlueprintWizard } from "@/components/wizards/create-blueprint-wizard"
import { FilePlus2 } from "lucide-react"
import { ComponentsPageSkeleton } from "@/components/components-page-skeleton"

// Mock blueprint data (same as dashboard)
const blueprints = [
  {
    id: "windows-server-2019",
    name: "Windows Server 2019",
    description: "Standard Windows Server 2019 with IIS and SQL Server",
    category: "Windows",
    vmCount: 1,
    networkCount: 1,
    estimatedDeployTime: "15 min",
    tags: ["windows", "server", "iis", "sql"]
  },
  {
    id: "linux-web-stack",
    name: "Linux Web Stack",
    description: "Ubuntu 22.04 with NGINX, PHP, and MySQL",
    category: "Linux",
    vmCount: 2,
    networkCount: 1,
    estimatedDeployTime: "10 min",
    tags: ["linux", "nginx", "php", "mysql"]
  },
  {
    id: "security-lab",
    name: "Security Lab",
    description: "Kali Linux and vulnerable VMs for penetration testing",
    category: "Security",
    vmCount: 4,
    networkCount: 2,
    estimatedDeployTime: "25 min",
    tags: ["kali", "penetration-testing", "vulnerable"]
  },
  {
    id: "enterprise-ad",
    name: "Enterprise Active Directory",
    description: "Windows domain with DC, member servers, and workstations",
    category: "Windows",
    vmCount: 5,
    networkCount: 2,
    estimatedDeployTime: "30 min",
    tags: ["windows", "active-directory", "domain"]
  },
  {
    id: "docker-swarm",
    name: "Docker Swarm Cluster",
    description: "Multi-node Docker Swarm with monitoring and load balancing",
    category: "Development",
    vmCount: 5,
    networkCount: 2,
    estimatedDeployTime: "20 min",
    tags: ["docker", "swarm", "containers", "monitoring"]
  },
  {
    id: "k8s-cluster",
    name: "Kubernetes Cluster",
    description: "Production-ready Kubernetes cluster with master and worker nodes",
    category: "Development",
    vmCount: 6,
    networkCount: 1,
    estimatedDeployTime: "35 min",
    tags: ["kubernetes", "k8s", "containers", "orchestration"]
  }
]

export default function BlueprintsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showBlueprintWizard, setShowBlueprintWizard] = useState(false)
  const [loading] = useState(false) // Mock loading state

  // Filter blueprints based on search
  const filteredBlueprints = blueprints.filter(blueprint =>
    blueprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blueprint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blueprint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blueprint.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <>
      <PageHeader 
        title="Blueprints" 
      />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {loading ? (
            <ComponentsPageSkeleton />
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search blueprints..."
                  className="max-w-md"
                />
                <Button
                  onClick={() => setShowBlueprintWizard(true)}
                  variant="elevated"
                >
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  Add Blueprint
                </Button>
              </div>

              {/* Blueprints Content */}
              <BlueprintsViewer
                data={filteredBlueprints}
                isLoading={loading}
                enablePagination={false}
              />
            </div>
          )}
        </div>
      </main>

      {/* Wizards */}
      <CreateBlueprintWizard
        open={showBlueprintWizard}
        onOpenChange={setShowBlueprintWizard}
        onSuccess={() => {
          console.log('Blueprint created successfully')
        }}
      />
    </>
  )
}