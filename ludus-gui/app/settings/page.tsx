"use client"

import { useState } from "react"
import { useTheme } from "@/lib/theme/theme-context"
import { Laptop, Moon, Sun } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form"
import { SecuritySettingsForm } from "@/components/settings/security-settings-form"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal/modal"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card/card-components"

export default function SettingsPage() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Settings" />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto pb-12 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and company information.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ProfileSettingsForm user={null} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-select" className="text-sm font-medium">
                  Theme
                </Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme-select" className="w-[200px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">
                      <div className="flex items-center">
                        <Laptop className="mr-2 h-4 w-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your password and account security settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)} className="mt-4">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Change Password</ModalTitle>
          </ModalHeader>
          <div className="pt-4 pb-2">
            <SecuritySettingsForm onSuccess={() => setIsPasswordModalOpen(false)} />
          </div>
        </ModalContent>
      </Modal>
    </div>
  )
}
