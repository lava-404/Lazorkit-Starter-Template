/**
 * Utility functions for common operations
 * 
 * Provides helper functions for className merging and string formatting
 * used throughout the application.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS class names, resolving conflicts intelligently
 * Combines clsx for conditional classes and twMerge for Tailwind-specific merging
 * 
 * @param inputs - Variable number of class values (strings, objects, arrays)
 * @returns Merged class string with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Truncates a string to a specified length with ellipsis in the middle
 * Useful for displaying long addresses or IDs in a compact format
 * 
 * @param str - String to truncate
 * @param len - Number of characters to show on each side (default: 4)
 * @param delimiter - String to insert in the middle (default: '..')
 * @returns Truncated string if longer than limit, otherwise original string
 * 
 * @example
 * ellipsify('1234567890', 3) // '123..890'
 */
export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}
