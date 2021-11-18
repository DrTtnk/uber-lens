import * as UL from "../src";

type NestedObject = {
    a: number;
    b: {
        c: string;
        d: {
            e: string;
            f: {
                g: {
                    code: number;
                    h: { i: { j: string; }[] }[]
                }[]
            }[]
        }
    }
};

const nestedObject: NestedObject = {
    a: 1,
    b: {
        c: '2',
        d: {
            e: '3',
            f: [{
                g: [{
                    code: 4,
                    h: [{
                        i: [{j: '4'}, {j: '5'}]
                    }]
                }]
            }]
        }
    }
};

const nestedLens = UL.uber<NestedObject>()('b', 'd', 'f', 0, 'g', 0, 'h', 0, 'i', 0, 'j');

const nestedLensGet = nestedLens.get(nestedObject);                     // '4'

const nestedLensSet = nestedLens.set(nestedObject, '6');
// { a: 1, b: { c: '2', d: { e: '3', f: [{ g: [{ h: [{ i: [{ j: '6' }, { j: '5' }] }] }] }] } } }

const nestedLensUpdate = nestedLens.mod(v => v + '7')(nestedObject);
// { a: 1, b: { c: '2', d: { e: '3', f: [{ g: [{ h: [{ i: [{ j: '47' }, { j: '5' }] }] }] }] } } }