import * as UL from '../src';

const trace = <T>(x: T): T => (console.log(x), x);

type SimpleObject = {
    a: number;
    b: { c: string; }
};

const simpleObject: SimpleObject = {
    a: 1,
    b: {c: '2'}
};

const simpleLens = UL.uber<SimpleObject>()('b', 'c');

const simpleLensGet    = simpleLens.get(simpleObject);               // '2'
const simpleLensSet    = simpleLens.set(simpleObject, '3');          // { a: 1, b: { c: '3' } }
const simpleLensUpdate = simpleLens.mod(v => v + '4')(simpleObject); // { a: 1, b: { c: '34' } }
