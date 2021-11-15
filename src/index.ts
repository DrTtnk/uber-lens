import {A, L, O, U, M} from "ts-toolbelt/out"
import * as R from "rambda";

// istanbul ignore next
const assertNever = (x: never): never => { throw new Error(`Unexpected object: ${x}`); };

type Match<T> = (x: T) => boolean;
type MatchAny<T> = { any: (x: T) => boolean };
type MatchAll<T> = { all: (x: T) => boolean };
type Index<T> = (x: T) => number;

const indexMaxBy = <T>(extract: (el: T) => number) => (arr: T[]): number =>
    R.findIndex(R.equals(Math.min(...(arr.map(extract)))), arr.map(extract));

const indexMinBy = <T>(extract: (el: T) => number) => (arr: T[]): number =>
    R.findIndex(R.equals(Math.min(...(arr.map(extract)))), arr.map(extract));

export type PartialMatch<T> = {
    [P in keyof T]?: T[P] extends L.List<infer U> ? Match<U>
                   : T[P] extends object          ? PartialMatch<T[P]> | Match<T[P]>
                   : T[P] | Match<T[P]>;
};

const comparePartial = <T>(matcher: PartialMatch<T>) => <S extends T>(obj: S): boolean => {
    // @ts-ignore
    return typeof matcher === "function" ? matcher(obj)
         : typeof matcher === "object"   ? R.keys(matcher).every(key => comparePartial(matcher[key] as any)(obj[key]))
         : matcher === obj;
};

export const matchOne = <T>(match: PartialMatch<T>) => ({ single: comparePartial<T>(match) })

export const matchMany = <T>(match: PartialMatch<T>) => ({ multi: comparePartial<T>(match) })

export const matchAll = () => ({ multi: <T>(_: T) => true } as const)

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
