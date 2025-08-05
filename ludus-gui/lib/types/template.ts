/**
 * Template types for the application
 */

/**
 * Template data type from Ludus API
 */
export interface TemplateObject {
  name: string;
  built: boolean;
}

/**
 * Template item for UI display
 */
export interface TemplateItem {
  id: string;
  name: string;
  built: "built" | "building" | "failed" | "not-built";
}

/**
 * Build status type for templates
 */
export type TemplateBuildStatus = TemplateItem["built"];