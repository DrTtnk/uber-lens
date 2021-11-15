import * as R from "rambda";
import * as C from "./comparer";
import {A, L} from "ts-toolbelt";

export const $many: unique symbol = Symbol("many");
export const $single: unique symbol = Symbol("one");
export const $fold: unique symbol = Symbol("fold");

export type Index<T> = (x: T) => number;

export const indexMaxBy = <T>(extract: (el: T) => number) => (arr: T[]): number =>
    R.findIndex(R.equals(Math.max(...(arr.map(extract)))), arr.map(extract));

export const indexMinBy = <T>(extract: (el: T) => number) => (arr: T[]): number =>
    R.findIndex(R.equals(Math.min(...(arr.map(extract)))), arr.map(extract));

export const indexOne = <T extends C.Comparer<any>>(match: T) => ({ single: C.comparePartial<T>(match) })
export const indexMany = <T extends C.Comparer<any>>(match: T) => ({ multi: C.comparePartial<T>(match) })
export const indexAll = ({ multi: <T>(_: T) => true } as const)

export const maxBy = <T>(extract: ((el: T) => number)) => ({ fold: indexMaxBy(extract) })
export const minBy = <T>(extract: ((el: T) => number)) => ({ fold: indexMinBy(extract) })

export const maxByProp = <K extends string, T extends Record<K, number>>(prop: K) => ({ fold: indexMaxBy<T>(R.prop(prop)) })
export const minByProp = <K extends string, T extends Record<K, number>>(prop: K) => ({ fold: indexMinBy<T>(R.prop(prop)) })
// endregion

export type Matcher<El>
    = { single: C.Match<El> }
    | { multi: C.Match<El> }
    | { fold: Index<El[]> }

export type Indexer<Obj> = A.Keys<Obj> | (Obj extends L.List<infer El> ? Matcher<El> : never)