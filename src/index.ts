import {A, L, O, U} from "ts-toolbelt/out"
import * as R from "rambda";

// istanbul ignore next
const assertNever = (x: never): never => { throw new Error(`Unexpected object: ${x}`); };

// region - COMPARER //////
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
// endregion


// region - INDEXER //////
export const $many: unique symbol = Symbol("many");
export const $single: unique symbol = Symbol("one");
export const $fold: unique symbol = Symbol("fold");

export type Index<T> = (x: T) => number;

export const indexMaxBy = <T>(extract: (el: T) => number) => (arr: T[]): number =>
    R.findIndex(R.equals(Math.max(...(arr.map(extract)))), arr.map(extract));

export const indexMinBy = <T>(extract: (el: T) => number) => (arr: T[]): number =>
    R.findIndex(R.equals(Math.min(...(arr.map(extract)))), arr.map(extract));

export const indexOne = <T>(match: Comparer<T>) => ({ single: comparePartial<Comparer<T>>(match) })
export const indexMany = <T>(match: Comparer<T>) => ({ multi: comparePartial<Comparer<T>>(match) })
export const indexAll = ({ multi: <T>(_: T) => true } as const)

export const maxBy = <T>(extract: ((el: T) => number)) => ({ fold: indexMaxBy(extract) })
export const minBy = <T>(extract: ((el: T) => number)) => ({ fold: indexMinBy(extract) })

export const maxByProp = <K extends string, T extends Record<K, number>>(prop: K) => ({ fold: indexMaxBy<T>(R.prop(prop)) })
export const minByProp = <K extends string, T extends Record<K, number>>(prop: K) => ({ fold: indexMinBy<T>(R.prop(prop)) })

export type Matcher<El>
    = { single: Match<El> }
    | { multi: Match<El> }
    | { fold: Index<El[]> }

export type Indexer<Obj> = A.Keys<Obj> | (Obj extends L.List<infer El> ? Matcher<El> : never)
// endregion

// region - LENS //////
type __P = { __placeholder__: never };

type IndexersToPath<IndexerPath extends L.List> = L.Replace<IndexerPath, Matcher<any>, number, 'extends->'>

type MakeIndexer<Obj, Path extends L.List> = __P | Indexer<O.Path<Obj, L.Exclude<IndexersToPath<Path>, [__P], 'extends->'>>>

type CleanPath<Path extends L.List> = L.Compulsory<IndexersToPath<L.Filter<Path, __P, '<-contains'>>>;

type Value<Obj extends object, Indexers extends any[]> = O.Path<Obj, CleanPath<Indexers>>;
type GetterMulti<Obj extends object, Indexers extends any[]> = U.Intersect<A.Keys<Indexers[number]>, "multi"> extends never
    ? Value<Obj, Indexers>
    : Value<Obj, Indexers>[];

export const uber = <Obj extends object>() => <
    K0  extends MakeIndexer<Obj, []>,
    K1  extends MakeIndexer<Obj, [K0]>,
    K2  extends MakeIndexer<Obj, [K0, K1]>,
    K3  extends MakeIndexer<Obj, [K0, K1, K2]>,
    K4  extends MakeIndexer<Obj, [K0, K1, K2, K3]>,
    K5  extends MakeIndexer<Obj, [K0, K1, K2, K3, K4]>,
    K6  extends MakeIndexer<Obj, [K0, K1, K2, K3, K4, K5]>,
    K7  extends MakeIndexer<Obj, [K0, K1, K2, K3, K4, K5, K6]>,
    K8  extends MakeIndexer<Obj, [K0, K1, K2, K3, K4, K5, K6, K7]>,
    K9  extends MakeIndexer<Obj, [K0, K1, K2, K3, K4, K5, K6, K7, K8]>,
    K10 extends MakeIndexer<Obj, [K0, K1, K2, K3, K4, K5, K6, K7, K8, K9]>,
    K11 extends MakeIndexer<Obj, [K0, K1, K2, K3, K4, K5, K6, K7, K8, K9, K10]>,
    K12 extends MakeIndexer<Obj, [K0, K1, K2, K3, K4, K5, K6, K7, K8, K9, K10, K11]>,
    K13 extends MakeIndexer<Obj, [K0, K1, K2, K3, K4, K5, K6, K7, K8, K9, K10, K11, K12]>,
>(...indexers: [K0, K1?, K2?, K3?, K4?, K5?, K6?, K7?, K8?, K9?, K10?, K11?, K12?, K13?]) => ({
    get: getterRecursive<Obj, GetterMulti<Obj, typeof indexers>>(...indexers as any),
    set: setterRecursive<Obj, Value<Obj, typeof indexers>>(...indexers as any),
    mod: modderRecursive<Obj, Value<Obj, typeof indexers>>(...indexers as any),
    indexers
});

const foldIndex = <El>(__obj: any[], p: { fold: any; init?: any }) =>
    __obj.reduce(
        (acc, el, idx) => p.fold(acc.curr, el) ? { curr: el, idx } : acc,
        { idx: -1, curr: p.init ? p.init(__obj) : __obj[0] }
    ).idx;

const getterRecursive =
    <T, Value>(...indexers: (undefined | Indexer<any>)[]) =>
    (obj: T): Value => {
        const __get = ([p, ...rest]: (Indexer<any> | undefined)[]) => (__obj: any): any => {
            if(p === undefined || __obj === undefined)
                return __obj;

            const get = __get(rest);

            if(typeof p === "string" || typeof p === "number" || typeof p === "symbol")
                return get(__obj[p]);
            if('single' in p)
                return get(__obj.find(p.single));
            if('multi' in p)
                return __obj.filter(p.multi).map(get);
            if('fold' in p)
                return get(__obj[p.fold(__obj)]);

            // istanbul ignore next
            return assertNever(p);
        };

        return __get(indexers)(obj);
    };

const setterRecursive =
    <T, Value>(...indexers: (undefined | Indexer<any>)[]) =>
    (obj: T, value: Value): T => modderRecursive<T, Value>(...indexers)(_ => value)(obj);

const modderRecursive =
    <T, Value>(...indexers: (undefined | Indexer<any>)[]) =>
    (fn: (input: Value) => Value) =>
    (obj: T): T => {
        const __mod = ([p, ...rest]: (Indexer<any> | undefined)[]) => (__obj: any): any => {
            if(p === undefined)
                return fn(__obj);

            const mod = __mod(rest);

            if(typeof p === "string" || typeof p === "symbol")
                return R.assoc(p as string, mod(__obj[p]), __obj);
            if(typeof p === "number")
                return __obj[p] ? R.update(p, mod(__obj[p]), __obj) : __obj;
            if('single' in p)
                return R.pipe(R.findIndex(p.single), R.unless(R.equals(-1), idx => R.update(idx, mod(__obj[idx]), __obj)))(__obj);
            if('multi' in p)
                return __obj.map((el: any) => p.multi(el) ? mod(el) : el);
            if('fold' in p)
                return R.update(p.fold(__obj), mod(__obj[p.fold(__obj)]), __obj);

            // istanbul ignore next
            return assertNever(p);
        };

        return __mod(indexers)(obj);
    };
// endregion