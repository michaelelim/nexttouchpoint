// This file contains type declarations for external modules without their own type definitions

/// <reference types="react" />
/// <reference types="react-dom" />

// Define React namespace explicitly
declare namespace React {
  interface FormEvent<T = Element> {
    preventDefault(): void;
    target: T;
  }
  
  interface ChangeEvent<T = Element> {
    target: T;
  }
  
  interface ReactNode {}
  
  interface FC<P = {}> {
    (props: P): ReactNode;
  }
  
  type ElementType = any;
  type ElementRef<T> = any;
  type ComponentPropsWithoutRef<T> = any;
  type JSXElementConstructor<P> = any;
  type ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> = any;
}

// Declare JSX namespace to fix JSX element errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface Element extends React.ReactElement {}
}

// Declare modules that don't have TypeScript declarations
declare module 'react' {
  export import React = React;
  
  // React Hooks
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useRef<T = undefined>(initialValue?: T): { current: T };
  
  export const Fragment: unique symbol;
  export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {}
  export interface DOMAttributes<T> {}
  export interface AriaAttributes {}
  
  export interface HTMLInputElement extends HTMLElement {
    value: string;
  }
  
  export interface HTMLFormElement extends HTMLElement {}
  export interface HTMLElement {}
}

// Add next-themes type declarations
declare module 'next-themes' {
  import { ReactNode } from 'react';
  
  export interface ThemeProviderProps {
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    children?: ReactNode;
    storageKey?: string;
    forcedTheme?: string;
    disableTransitionOnChange?: boolean;
    themes?: string[];
  }

  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
  
  export function useTheme(): {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    systemTheme?: string;
    themes: string[];
  };
}

// Add Radix UI radio group type declarations
declare module '@radix-ui/react-radio-group' {
  import * as React from 'react';
  
  interface RadioGroupRootProps extends React.ComponentPropsWithoutRef<'div'> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
  }
  
  interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<'button'> {
    value: string;
  }
  
  export const Root: React.ForwardRefExoticComponent<RadioGroupRootProps & React.RefAttributes<HTMLDivElement>>;
  export const Item: React.ForwardRefExoticComponent<RadioGroupItemProps & React.RefAttributes<HTMLButtonElement>>;
  export const Indicator: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<'span'> & React.RefAttributes<HTMLSpanElement>>;
}

declare module 'sonner' {
  import * as React from 'react';
  
  export const toast: {
    success(message: string): void;
    error(message: string): void;
    [key: string]: any;
  };
  
  export interface ToasterProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    expand?: boolean;
    visibleToasts?: number;
    closeButton?: boolean;
    offset?: string | number;
    duration?: number;
    theme?: 'light' | 'dark' | 'system';
    richColors?: boolean;
    [key: string]: any;
  }
  
  export function Toaster(props?: ToasterProps): JSX.Element;
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