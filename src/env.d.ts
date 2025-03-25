// This file contains type declarations for external modules without their own type definitions

/// <reference types="react" />
/// <reference types="react-dom" />

// Declare JSX namespace to fix JSX element errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Declare modules that don't have TypeScript declarations
declare module 'sonner' {
  export const toast: {
    success(message: string): void;
    error(message: string): void;
    [key: string]: any;
  };
}

// Enable importing CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Fix event type errors
interface EventTarget {
  value: any;
}

// Fix any other missing module declarations
declare module 'next/navigation' {
  export function useRouter(): {
    push(url: string): void;
    [key: string]: any;
  };
}

declare module 'date-fns' {
  export function format(date: Date, format: string): string;
  export function parseISO(date: string): Date;
  export function startOfDay(date: Date): Date;
  export function differenceInDays(dateLeft: Date, dateRight: Date): number;
  export function addDays(date: Date, amount: number): Date;
  export function eachDayOfInterval(interval: {start: Date, end: Date}): Date[];
  
  export function getMonth(date: Date): number;
  export function getYear(date: Date): number;
  export function getDate(date: Date): number;
}

declare module 'recharts' {
  export const Bar: any;
  export const BarChart: any;
  export const ResponsiveContainer: any;
  export const Tooltip: any;
  export const XAxis: any;
  export const YAxis: any;
}

declare module 'lucide-react' {
  export const Copy: any;
  export const Mail: any;
  export const Phone: any;
  export const MapPin: any;
  export const Calendar: any;
  export const GraduationCap: any;
  export const Hash: any;
  export const ClipboardList: any;
  export const History: any;
  export const Search: any;
  export const Circle: any;
} 