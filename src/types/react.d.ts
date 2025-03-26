// Custom React type augmentation to resolve type conflicts
// This file should be included in tsconfig.json

import 'react';

// This empty declaration allows us to use the existing React types without conflicts
// It prevents our custom declarations from overriding the official ones
declare module 'react' {}

declare module 'react' {
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  
  export type Key = string | number;
  
  export type JSXElementConstructor<P> =
    | ((props: P) => ReactElement<any, any> | null)
    | (new (props: P) => Component<any, any>);
  
  export interface RefObject<T> {
    readonly current: T | null;
  }
  
  export type Ref<T> = RefCallback<T> | RefObject<T> | null;
  export type RefCallback<T> = (instance: T | null) => void;
  
  export interface HTMLProps<T> extends AllHTMLAttributes<T> {}
  export interface AllHTMLAttributes<T> extends HTMLAttributes<T> {}
  export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {}
  export interface AriaAttributes {}
  
  export interface DOMAttributes<T> {
    children?: ReactNode;
    dangerouslySetInnerHTML?: {
      __html: string;
    };
    onBlur?: (event: FocusEvent<T>) => void;
    onChange?: (event: ChangeEvent<T>) => void;
    onClick?: (event: MouseEvent<T>) => void;
    onFocus?: (event: FocusEvent<T>) => void;
    onInput?: (event: FormEvent<T>) => void;
    onKeyDown?: (event: KeyboardEvent<T>) => void;
    onKeyUp?: (event: KeyboardEvent<T>) => void;
    onSubmit?: (event: FormEvent<T>) => void;
  }
  
  export interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {}
  export interface MouseEvent<T = Element> extends SyntheticEvent<T> {}
  export interface KeyboardEvent<T = Element> extends SyntheticEvent<T> {}
  export interface FocusEvent<T = Element> extends SyntheticEvent<T> {}
  
  export interface SyntheticEvent<T = Element, E = Event> {
    currentTarget: EventTarget & T;
    target: EventTarget & T;
    preventDefault(): void;
    stopPropagation(): void;
  }
  
  export interface EventTarget {
    value?: any;
  }
  
  export type ReactNode =
    | ReactElement
    | string
    | number
    | Iterable<ReactNode>
    | boolean
    | null
    | undefined;
  
  export type FC<P = {}> = FunctionComponent<P>;
  export interface FunctionComponent<P = {}> {
    (props: P): ReactElement<any, any> | null;
  }
  
  export class Component<P, S> {
    constructor(props: P);
    props: P;
    state: S;
    setState(state: Partial<S> | ((state: S) => Partial<S>), callback?: () => void): void;
    render(): ReactNode;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useRef<T = undefined>(initialValue?: T): { current: T };
} 