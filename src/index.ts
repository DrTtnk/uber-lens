import {A, L, O, U, M} from "ts-toolbelt/out"
import * as R from "rambda";
import * as tf from "type-fest"

// istanbul ignore next
const assertNever = (x: never): never => { throw new Error(`Unexpected object: ${x}`); };

export const $any: unique symbol = Symbol("any");
export const $all: unique symbol = Symbol("all");

export const $many: unique symbol = Symbol("many");
export const $single: unique symbol = Symbol("one");
export const $fold: unique symbol = Symbol("fold");

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
const indexMaxBy = <T>(extract: (el: T) => number) => (arr: T[]): number =>
    R.findIndex(R.equals(Math.min(...(arr.map(extract)))), arr.map(extract));

const indexMinBy = <T>(extract: (el: T) => number) => (arr: T[]): number =>
    R.findIndex(R.equals(Math.min(...(arr.map(extract)))), arr.map(extract));

export const comparePartial = <T extends Comparer<any>>(matcher: T) => <S extends ComparerToObject<T>>(obj: S): boolean => {
    // Case: matcher is a primitive
    // @ts-ignore
    if(["string", "number", "boolean"].includes(typeof matcher)) return obj === matcher;

    // Case: matcher is a symbol
    // @ts-ignore
    if (typeof matcher === "symbol") return obj.toString() === matcher.toString();

    // Case: matcher is a Date
    if (matcher instanceof Date) return obj instanceof Date && obj.getTime() === matcher.getTime();

    // Case: matcher is an object
    if (typeof matcher === 'object'){
        if((matcher as any)[$all])
            return (obj as any[]).every(comparePartial((matcher as any)[$all]));
        if((matcher as any)[$any])
            return (obj as any[]).some(comparePartial((matcher as any)[$any]));
        // @ts-ignore
        return R.keys(matcher).every(key => obj[key] && comparePartial(matcher[key] as any)(obj[key]));
    }

    // Case: matcher is a function
    // @ts-ignore
    if (typeof matcher === 'function') return matcher(obj);

    return false;
};

export type Index<T> = (x: T) => number;

export const indexOne = <T extends Comparer<any>>(match: T) => ({ single: comparePartial<T>(match) })
export const indexMany = <T extends Comparer<any>>(match: T) => ({ multi: comparePartial<T>(match) })
export const indexAll = ({ multi: <T>(_: T) => true } as const)

export const maxBy = <T>(extract: ((el: T) => number)) => ({ fold: indexMaxBy(extract) })
export const minBy = <T>(extract: ((el: T) => number)) => ({ fold: indexMinBy(extract) })

export const maxByProp = <K extends string, T extends Record<K, number>>(prop: K) => ({ fold: indexMaxBy<T>(R.prop(prop)) })
export const minByProp = <K extends string, T extends Record<K, number>>(prop: K) => ({ fold: indexMinBy<T>(R.prop(prop)) })
// endregion

type __P = { __placeholder__: never };

export type Matcher<El>
    = { single: Match<El> }
    | { multi: Match<El> }
    | { fold: Index<El[]> }

type Indexer<Obj> = A.Keys<Obj> | (Obj extends L.List<infer El> ? Matcher<El> : never)

type IndexersToPath<IndexerPath extends L.List> = L.Replace<IndexerPath, Matcher<any>, number, 'extends->'>

type MakeIndexer<Obj, Path extends L.List> = __P | Indexer<O.Path<Obj, L.Exclude<IndexersToPath<Path>, [__P], 'extends->'>>>

type CleanPath<Path extends L.List> = L.Compulsory<IndexersToPath<L.Filter<Path, __P, '<-contains'>>>;

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
>(...indexers: [K0, K1?, K2?, K3?, K4?, K5?, K6?, K7?, K8?, K9?, K10?, K11?, K12?, K13?]) => {
    type Indexers = typeof indexers;
    type Value<Obj extends object> = O.Path<Obj, CleanPath<Indexers>>;
    type GetterMulti<Obj extends object> = U.Intersect<A.Keys<Indexers[number]>, "multi"> extends never ? Value<Obj> : Value<Obj>[];

    return ({
        get: getterRecursive<Obj, GetterMulti<Obj>>(...indexers as any),
        set: setterRecursive<Obj, Value<Obj>>(...indexers as any),
        mod: modderRecursive<Obj, Value<Obj>>(...indexers as any),
        indexers
    });
};

const foldIndex = <El>(__obj: any[], p: { fold: any; init?: any }) =>
    __obj.reduce(
        (acc, el, idx) => p.fold(acc.curr, el) ? { curr: el, idx } : acc,
        { idx: -1, curr: p.init ? p.init(__obj) : __obj[0] }
    ).idx;

const getterRecursive =
    <T, Value>(...indexers: (undefined | Indexer<any>)[]) =>
    (obj: T): Value => {
    const __get = ([p, ...rest]: (Indexer<any> | undefined)[], __obj: any): any => {
        if(p === undefined || __obj === undefined)
            return __obj;
        if(typeof p === "string" || typeof p === "number" || typeof p === "symbol")
            return __get(rest, __obj[p]);
        if('single' in p)
            return __get(rest, __obj.find(p.single));
        if('multi' in p)
            return __obj.filter(p.multi).map((e: any) => __get(rest, e));
        if('fold' in p)
            return __get(rest, __obj[p.fold(__obj)]);
        if('foldMany' in p)
            return __get(rest, __obj[foldIndex(__obj, p)]);

        return assertNever(p);
    };

    return __get(indexers, obj);
};

const setterRecursive =
    <T, Value>(...indexers: (undefined | Indexer<any>)[]) =>
    (obj: T) =>
    (value: Value): T => modderRecursive<T, Value>(...indexers)(_ => value)(obj);

const modderRecursive =
    <T, Value>(...indexers: (undefined | Indexer<any>)[]) =>
    (fn: (input: Value) => Value) =>
    (obj: T): T => {
        const __mod = ([p, ...rest]: (Indexer<any> | undefined)[]) => (__obj: any): any => {
            if(p === undefined) return fn(__obj);

            const mod = __mod(rest);
            if(typeof p === "string" || typeof p === "symbol")
                return R.assoc(p as string, mod(__obj[p]), __obj);
            if(typeof p === "number")
                return __obj[p] ? R.update(p, mod(__obj[p]), __obj) : __obj;
            if('single' in p){
                const index = __obj.findIndex(p.single);
                return index != -1 ? R.update(index, __mod(__obj[index]), __obj) : __obj;
            }
            if('multi' in p)
                return __obj.map((el: any) => p.multi(el) ? mod(el) : el);
            if('fold' in p)
                return mod(__obj[p.fold(__obj)]);

            return assertNever(p);
        };

        return __mod(indexers)(obj);
};
