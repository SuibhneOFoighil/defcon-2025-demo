import type React from "react"
import type { Metadata } from "next"
import { inter, barlow } from "./fonts"
import "./tailwind.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Ludus",
  description: "Cyber Ranges Platform"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${barlow.variable}`}>
      <body>
        <Providers>{children}</Providers>
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}
