import * as R from "rambda";

export const $any: unique symbol = Symbol("any");
export const $all: unique symbol = Symbol("all");

export type Match<T> = (x: T) => boolean;
export type MatchAny<T> = { [$any]: Comparer<T> };
export type MatchAll<T> = { [$all]: Comparer<T> };

export const matchAny = <T>(matcher: Comparer<T>): MatchAny<T> => ({ [$any]: matcher } as const);
export const matchAll = <T>(matcher: Comparer<T>): MatchAll<T> => ({ [$all]: matcher } as const);

export type Comparer<T>
    = T
    | ((x: T) => boolean)
    | (T extends object ? ({ [K in keyof T]: Comparer<T[K]> }) : never)
    | (T extends (infer U)[] ? MatchAny<U> | MatchAll<U> : never)

// Converts a comparer to an object, inferring the type of the function arguments

type ComparerToObject<T>
    = T extends (x: infer A) => boolean ? A
    : T extends MatchAll<infer U> | MatchAny<infer U> ? ComparerToObject<U>[]
    : T extends object ? { [K in keyof T]: ComparerToObject<T[K]> }
    : T;

export const comparePartial = <T extends Comparer<any>>(matcher: T) => <S extends ComparerToObject<T>>(obj: S): boolean => {
    if(["string", "number", "boolean"].includes(typeof matcher)) return obj === matcher;

    if (typeof matcher === "symbol" && typeof obj === "symbol") return obj.toString() === matcher.toString();

    if (matcher instanceof Date) return obj instanceof Date && obj.getTime() === matcher.getTime();

    if (typeof matcher === 'function') return matcher(obj);

    if (Array.isArray(matcher) && Array.isArray(obj)) return R.equals(matcher as any[], obj);

    if (typeof matcher === 'object'){
        if((matcher as any)[$all] && Array.isArray(obj))
            return obj.every(comparePartial((matcher as any)[$all]));
        if((matcher as any)[$any] && Array.isArray(obj))
            return obj.some(comparePartial((matcher as any)[$any]));
        if (typeof obj === 'object' && !Array.isArray(obj))
            return R.keys(matcher).every(key => (obj as any)[key] && comparePartial((matcher as any)[key])((obj as any)[key]));
    }

    return false;
};
