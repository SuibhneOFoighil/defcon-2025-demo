"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { X, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal/modal"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useVMDefaultsForm } from "@/hooks/use-vm-defaults-form"
import { cn } from "@/lib/utils"
import type { VMDefaults, FunctionalLevel } from "@/lib/types/range-config"
import { FUNCTIONAL_LEVELS } from "@/lib/types/range-config"
import { componentLogger } from "@/lib/logger"

interface VMDefaultsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (defaults: VMDefaults) => void
  initialDefaults?: Partial<VMDefaults>
}


const DEFAULT_VM_DEFAULTS: VMDefaults = {
  snapshot_with_RAM: true,
  stale_hours: 24,
  ad_domain_functional_level: "Win2012R2",
  ad_forest_functional_level: "Win2012R2",
  ad_domain_admin: "",
  ad_domain_admin_password: "",
  ad_domain_user: "",
  ad_domain_user_password: "",
  ad_domain_safe_mode_password: "",
  timezone: "UTC",
  enable_dynamic_wallpaper: true,
}

const createDefaultsWithFallbacks = (initialDefaults: Partial<VMDefaults>): VMDefaults => ({
  ...DEFAULT_VM_DEFAULTS,
  ...initialDefaults,
})

export function VMDefaultsModal({
  isOpen,
  onClose,
  onSave,
  initialDefaults = {}
}: VMDefaultsModalProps) {

  const defaultsWithFallbacks = createDefaultsWithFallbacks(initialDefaults)
  
  const form = useVMDefaultsForm({
    initialData: defaultsWithFallbacks,
    onSave: async (data) => {
      // For the modal, we still want to save on explicit user action
      // So we'll use onSave if provided, otherwise this is a no-op
      if (onSave) {
        await Promise.resolve(onSave({ ...defaultsWithFallbacks, ...data }))
      }
    }
  })

  const {
    pendingFields,
    updateField,
    updateLocalField,
    forceSaveField
  } = form

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    ad_domain_admin_password: false,
    ad_domain_user_password: false,
    ad_domain_safe_mode_password: false,
  })

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Update form when initialDefaults changes (handles async data loading)
  useEffect(() => {
    componentLogger.info({ initialDefaults, component: 'VMDefaultsModal' }, 'initialDefaults changed')
    if (initialDefaults && Object.keys(initialDefaults).length > 0) {
      const newDefaults = createDefaultsWithFallbacks(initialDefaults)
      form.reset(newDefaults)
    }
  }, [initialDefaults])


  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent size="lg" className="max-h-[80vh] flex flex-col" showClose={false}>
        <Form {...form}>
        <ModalHeader className="sticky top-0 bg-background border-b pb-4 z-10 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          <ModalTitle>VM Defaults Configuration</ModalTitle>
          <ModalDescription>
            Configure default settings for all VMs and Windows Domains in ranges
          </ModalDescription>
        </ModalHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6 py-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">General Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="UTC"
                        onChange={(e) => updateLocalField("timezone", e.target.value)}
                        onSave={() => forceSaveField("timezone")}
                        className={cn(pendingFields.has("timezone") && "border-blue-500")}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Unix TZ format timezone for all VMs
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stale_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stale Hours</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        value={field.value || 24}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 24
                          field.onChange(value)
                          updateField("stale_hours", value)
                        }}
                        className={cn(pendingFields.has("stale_hours") && "border-blue-500")}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Hours until snapshot deletion/retaking
                    </p>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="snapshot_with_RAM"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Snapshot with RAM</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Capture RAM state when entering testing mode
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          updateField("snapshot_with_RAM", checked)
                        }}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enable_dynamic_wallpaper"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Dynamic Wallpaper</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Enable dynamic wallpaper for Windows VMs
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          updateField("enable_dynamic_wallpaper", checked)
                        }}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Active Directory Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Active Directory Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ad_domain_functional_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain Functional Level</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value as FunctionalLevel)
                          updateField("ad_domain_functional_level", value as FunctionalLevel)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FUNCTIONAL_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ad_forest_functional_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forest Functional Level</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value as FunctionalLevel)
                          updateField("ad_forest_functional_level", value as FunctionalLevel)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FUNCTIONAL_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ad_domain_admin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain Admin Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Administrator"
                        onChange={(e) => updateLocalField("ad_domain_admin", e.target.value)}
                        onSave={() => forceSaveField("ad_domain_admin")}
                        className={cn(pendingFields.has("ad_domain_admin") && "border-blue-500")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ad_domain_admin_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain Admin Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPasswords.ad_domain_admin_password ? "text" : "password"}
                          onChange={(e) => updateLocalField("ad_domain_admin_password", e.target.value)}
                          onSave={() => forceSaveField("ad_domain_admin_password")}
                          className={cn("pr-10", pendingFields.has("ad_domain_admin_password") && "border-blue-500")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility("ad_domain_admin_password")}
                        >
                          {showPasswords.ad_domain_admin_password ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ad_domain_user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain User Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="user"
                        onChange={(e) => updateLocalField("ad_domain_user", e.target.value)}
                        onSave={() => forceSaveField("ad_domain_user")}
                        className={cn(pendingFields.has("ad_domain_user") && "border-blue-500")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ad_domain_user_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain User Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPasswords.ad_domain_user_password ? "text" : "password"}
                          onChange={(e) => updateLocalField("ad_domain_user_password", e.target.value)}
                          onSave={() => forceSaveField("ad_domain_user_password")}
                          className={cn("pr-10", pendingFields.has("ad_domain_user_password") && "border-blue-500")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility("ad_domain_user_password")}
                        >
                          {showPasswords.ad_domain_user_password ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ad_domain_safe_mode_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Safe Mode Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPasswords.ad_domain_safe_mode_password ? "text" : "password"}
                        onChange={(e) => updateLocalField("ad_domain_safe_mode_password", e.target.value)}
                        onSave={() => forceSaveField("ad_domain_safe_mode_password")}
                        className={cn("pr-10", pendingFields.has("ad_domain_safe_mode_password") && "border-blue-500")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("ad_domain_safe_mode_password")}
                      >
                        {showPasswords.ad_domain_safe_mode_password ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Directory Services Restore Mode password
                  </p>
                </FormItem>
              )}
            />
          </div>
          </div>
        </div>
        </Form>
      </ModalContent>
    </Modal>
  )
}