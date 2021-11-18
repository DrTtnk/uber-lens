import * as UL from "../src";

type SimpleUnion = { a: number; } | { b: { c: string; } };

const simpleUnion: SimpleUnion = {a: 1};
const simpleUnion2: SimpleUnion = {b: {c: 'prop'}};

const simpleUnionLens = UL.uber<SimpleUnion>()('a');
const simpleUnionLens2 = UL.uber<SimpleUnion>()('b', 'c');

const simpleUnionLensGet    = simpleUnionLens.get(simpleUnion);                  // 1
const simpleUnionLensSet    = simpleUnionLens.set(simpleUnion, 100);             // { a: 100 }
const simpleUnionLensUpdate = simpleUnionLens.mod(v => v && v + 3)(simpleUnion); // { a: 103 }

const simpleUnionLens2Get    = simpleUnionLens2.get(simpleUnion2);                        // 'prop'
const simpleUnionLens2Set    = simpleUnionLens2.set(simpleUnion2, '100');                 // { b: { c: 'prop100' } }
const simpleUnionLens2Update = simpleUnionLens2.mod(v => v?.toUpperCase())(simpleUnion2); // { b: { c: 'PROP' } }

const simpleUnionLensGet3    = simpleUnionLens.get(simpleUnion2);                  // undefined
const simpleUnionLensSet3    = simpleUnionLens.set(simpleUnion2, 100);             // { b: { c: 'prop' } } <- unchanged
const simpleUnionLensUpdate3 = simpleUnionLens.mod(v => v && v + 3)(simpleUnion2); // { b: { c: 'prop' } } <- unchanged
