import * as UL from "../src";

type Object = {
    a: number[];
    b: { c: { code: number, value: string }[]; }
};

const simpleArrayObject: Object = {
    a: [1, 2, 3],
    b: {c: [{code: 10, value: '1'}, {code: 20, value: '2'}, {code: 30, value: '3'}]}
};

const simpleMatchOne = UL.uber<Object>()('b', 'c', UL.indexOne({code: 2}), 'value');

const simpleMatchOneGet    = simpleMatchOne.get(simpleArrayObject); // '2'
const simpleMatchOneSet    = simpleMatchOne.set(simpleArrayObject, '3');
// { a: [ 1, 2, 3 ], b: { c: [ { code: 10, value: '1' }, { code: 20, value: '3' }, { code: 30, value: '3' } ] } }
const simpleMatchOneUpdate = simpleMatchOne.mod(v => v && `${v}4`)(simpleArrayObject);
// { a: [ 1, 2, 3 ], b: { c: [ { code: 10, value: '1' }, { code: 20, value: '34' }, { code: 30, value: '3' } ] } }

const simpleMatchMany = UL.uber<Object>()('b', 'c', UL.indexMany({code: (c: number) => c > 15}), 'value');

const simpleMatchManyGet    = simpleMatchMany.get(simpleArrayObject); // [ '2', '3' ]
const simpleMatchManySet    = simpleMatchMany.set(simpleArrayObject, '3');
// { a: [ 1, 2, 3 ], b: { c: [ { code: 10, value: '1' }, { code: 20, value: '3' }, { code: 30, value: '3' } ] } }
const simpleMatchManyUpdate = simpleMatchMany.mod(v => v && `${v}4`)(simpleArrayObject);
// { a: [ 1, 2, 3 ], b: { c: [ { code: 10, value: '1' }, { code: 20, value: '34' }, { code: 30, value: '34' } ] } }

const simpleMatchAll = UL.uber<Object>()('a', UL.indexAll);

const simpleMatchAllGet    = simpleMatchAll.get(simpleArrayObject); // [ 1, 2, 3 ]

const simpleMatchAllSet    = simpleMatchAll.set(simpleArrayObject, 10);
// { a: [ 10, 10, 10 ], b: { c: [ { code: 10, value: '1' }, { code: 20, value: '3' }, { code: 30, value: '3' } ] } }

const simpleMatchAllUpdate = simpleMatchAll.mod(v => v && (v + 100))(simpleArrayObject);
// { a: [ 110, 110, 110 ], b: { c: [ { code: 10, value: '1' }, { code: 20, value: '3' }, { code: 30, value: '3' } ] } }
