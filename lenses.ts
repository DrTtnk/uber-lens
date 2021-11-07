import * as R from 'ramda'

export type Lens<Obj, T> = {
    get: (obj: Obj) => T;
    mod: (f: (el: T) => T) => (obj: Obj) => Obj;
}

const lensProp = <S, K extends keyof S = keyof S>(prop: K): Lens<S, S[K]> => ({
    get: obj => obj[prop],
    mod: fn => obj => ({...obj, [prop]: fn(obj[prop])}),
})

const lensIndex = <S>(index: number): Lens<S[], S> => ({
    get: obj => obj[index],
    mod: fn => obj => R.update(index, fn(obj[index]), obj),
})

const lensFirstMatch = <S>(match: (el: S) => boolean): Lens<S[], S> => ({
    get: obj => R.find(match, obj)!,
    mod: fn => obj => lensIndex<S>(R.findIndex(match, obj)).mod(fn)(obj),
})

const match = <T>(match: T) => <S extends T>(el: S): boolean => typeof match === 'object' && R.equals(R.pick(R.keys(match), el), el) || match === el