import Image from "next/image";
import { HardDrive, Server, Monitor, Shield } from "lucide-react";

/**
 * Returns a React component for template icons based on template name string matching
 * @param templateName - The name of the template to get an icon for
 * @param className - Optional CSS classes to apply (defaults to "h-12 w-12 text-muted-foreground")
 * @returns React component representing the appropriate template icon
 */
export function getTemplateIcon(
  templateName: string,
  className: string = "h-12 w-12 text-muted-foreground"
): React.ReactElement {
  const name = templateName.toLowerCase();

  // Custom SVG icons for specific operating systems
  if (name.includes('debian')) {
    return (
      <Image
        src="/template-icons/debian.svg"
        alt="Debian"
        width={48}
        height={48}
        className={className}
      />
    );
  }

  if (name.includes('kali')) {
    return (
      <Image
        src="/template-icons/kalilinux.png"
        alt="Kali Linux"
        width={48}
        height={48}
        className={className}
      />
    );
  }

  if (name.includes('ubuntu')) {
    return (
      <Image
        src="/template-icons/ubuntu.svg"
        alt="Ubuntu"
        width={48}
        height={48}
        className={className}
      />
    );
  }

  if (name.includes('win') || name.includes('windows')) {
    return (
      <Image
        src="/template-icons/windows.svg"
        alt="Windows"
        width={48}
        height={48}
        className={className}
      />
    );
  }

  if (name.includes('rocky')) {
    return (
      <Image
        src="/template-icons/rocky.svg"
        alt="Rocky Linux"
        width={48}
        height={48}
        className={className}
      />
    );
  }

  if (name.includes('centos')) {
    return (
      <Image
        src="/template-icons/centos.ico"
        alt="CentOS"
        width={48}
        height={48}
        className={className}
      />
    );
  }

  // Specialized security VMs
  if (name.includes('commando')) {
    return (
      <Image
        src="/template-icons/commando.png"
        alt="Commando VM"
        width={48}
        height={48}
        className={className}
      />
    )
  }

  if (name.includes('flare')) {
    return (
      <Image
        src="/template-icons/flare-vm.png"
        alt="Flare"
        width={48}
        height={48}
        className={className}
      />
    )
  }

  if (name.includes('remnux')) {
    return <Shield className={className} />;
  }

  // Fallback logic for unmatched templates
  if (name.includes('desktop') || name.includes('workstation')) {
    return <Monitor className={className} />;
  }

  if (name.includes('server')) {
    return <Server className={className} />;
  }

  // Default fallback
  return <HardDrive className={className} />;
}

/**
 * Template icon component with consistent sizing
 */
export function TemplateIcon({ templateName, className }: { templateName: string; className?: string }) {
  return getTemplateIcon(templateName, className);
}