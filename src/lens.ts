import {A, L, O, U} from "ts-toolbelt/out"
import * as R from "rambda";
import * as I from "./indexer";

// istanbul ignore next
const assertNever = (x: never): never => { throw new Error(`Unexpected object: ${x}`); };

type __P = { __placeholder__: never };

type IndexersToPath<IndexerPath extends L.List> = L.Replace<IndexerPath, I.Matcher<any>, number, 'extends->'>

type MakeIndexer<Obj, Path extends L.List> = __P | I.Indexer<O.Path<Obj, L.Exclude<IndexersToPath<Path>, [__P], 'extends->'>>>

type CleanPath<Path extends L.List> = L.Compulsory<IndexersToPath<L.Filter<Path, __P, '<-contains'>>>;

type Value<Indexers extends any[], Obj extends object> = O.Path<Obj, CleanPath<Indexers>>;
type GetterMulti<Indexers extends any[], Obj extends object> = U.Intersect<A.Keys<Indexers[number]>, "multi"> extends never
    ? Value<Indexers, Obj>
    : Value<Indexers, Obj>[];

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
    get: getterRecursive<Obj, GetterMulti<typeof indexers, Obj>>(...indexers as any),
    set: setterRecursive<Obj, Value<typeof indexers, Obj>>(...indexers as any),
    mod: modderRecursive<Obj, Value<typeof indexers, Obj>>(...indexers as any),
    indexers
});

const foldIndex = <El>(__obj: any[], p: { fold: any; init?: any }) =>
    __obj.reduce(
        (acc, el, idx) => p.fold(acc.curr, el) ? { curr: el, idx } : acc,
        { idx: -1, curr: p.init ? p.init(__obj) : __obj[0] }
    ).idx;

const getterRecursive =
    <T, Value>(...indexers: (undefined | I.Indexer<any>)[]) =>
    (obj: T): Value => {
    const __get = ([p, ...rest]: (I.Indexer<any> | undefined)[]) => (__obj: any): any => {
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
    <T, Value>(...indexers: (undefined | I.Indexer<any>)[]) =>
    (obj: T) =>
    (value: Value): T => modderRecursive<T, Value>(...indexers)(_ => value)(obj);

const modderRecursive =
    <T, Value>(...indexers: (undefined | I.Indexer<any>)[]) =>
    (fn: (input: Value) => Value) =>
    (obj: T): T => {
        const __mod = ([p, ...rest]: (I.Indexer<any> | undefined)[]) => (__obj: any): any => {
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
