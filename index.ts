import {A, B, C, F, I, L, N, O, S, U} from "ts-toolbelt"

type Decr = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

export type At<O extends object, K extends A.Key> = O.At<O, K, 0>;

type AnyRecord = Record<any, any>
type AnyArray = any[]|readonly any[]
type AnyStruct = AnyRecord|AnyArray

// KeyOf array or object
type KeyOf<T>
    = T extends AnyArray  ? number
    : T extends AnyRecord ? keyof T
                          : never

type Indexer<El, K> = K | El | ((el: El) => boolean)

// Return an union type of all the possible paths in the object tree that can be accessed with a key or a number index or a function that returns a number or a number[]
type IndexerPaths<
    O extends AnyStruct, 
    N extends number = 5, 
    K extends KeyOf<O> = KeyOf<O>,
> 
    = N extends 0 ? never
    : KeyOf<O> extends never ? never
    : K extends K ? [Indexer<At<O, K>, K>, ...([] | IndexerPaths<At<O, K>, Decr[N]>)] : never;

type IndexerPathToPath<T extends Indexer<any, any>[]> = 
    T extends [infer K, ...infer R] ? [Exclude<K, Function>, ...IndexerPathToPath<R>] : never

const get =
    <S extends object>() =>
    <Path extends IndexerPaths<S>>(...path: Path) =>
    (obj: S): O.Path<S, IndexerPathToPath<Path>, 0> | Path => {
        // @ts-ignore
        return path.reduce((res, item) => typeof item === 'function' ? res.find(item) : res[item], obj as any) as any
    }

const test = {a: {b: [100, 200]}};

const deepObject = {
    a: {
        b: [100, { c: 'sadafa' }],
        c: { d: [200], e: [300], f: [400] },
    }
}

type UnionArray = { p: number[] | string[] };
const zz: O.Paths<typeof unionTest> = [0, 1, 'c']

type Test = typeof test;
type DeepTest = typeof deepObject;
type UnionTest = { parent: { a: number[] } | { b: string[] }};

const unionTest = { parent: { a: [100] } }
type u = At<UnionTest['parent'], 'a'>

const x = get<Test>()('a', 'b', 1)(test)
const r = get<Test>()<['a']>('a')(test)

const j = get<UnionTest>()('parent', 'a')(unionTest)

const y: string = get<Test>()('a', 'b', n => n > 0)(test)
const z = get<DeepTest>()('a', 'b', 1, 'c')(deepObject)

const u1 = get<UnionTest>()("parent", "a", n => n > 0)(unionTest)
const u2 = get<UnionTest>()("parent", "a", 0)(unionTest)

type AtFromUnion = At<UnionArray, 'x'>
const u = get<UnionArray>()('p', 0)({ p: [100] })

type uPath = O.Path<UnionTest, ['parent', 'a'], 0>

const d = get<DeepTest>()('a', 'c', 'd', n => n > 0)
