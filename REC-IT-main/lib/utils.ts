// Utility functions for the REC-IT app
// You can add more helpers here as needed

// Class name merge utility (used by shadcn/ui and others)
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
