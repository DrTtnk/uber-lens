import UL from '../src/index';

describe('Uber lens', () => {

    describe('matchers', () => {

        describe('matchers with logic', () => {
            it('Match primitive types', () =>{
                const matcher = (x: string) => x === 'a';
                expect(UL.comparePartial(matcher)('a')).toBe(true);
                expect(UL.comparePartial(matcher)('b')).toBe(false);

                // @ts-expect-error
                expect(UL.comparePartial(matcher)(10)).toBeDefined();
            });

            it('Match objects', () =>{
                const matcher = (x: { a: string }) => x.a === 'a';
                expect(UL.comparePartial(matcher)({ a: 'a' })).toBe(true);
                expect(UL.comparePartial(matcher)({ a: 'b' })).toBe(false);

                // @ts-expect-error
                expect(UL.comparePartial(matcher)({ a: 10 })).toBeDefined();
            });

            it('Match with nested functions', () =>{
                const matcher = { b: (x: string) => x === 'c' };
                expect(UL.comparePartial(matcher)({ b: 'b' })).toBe(false);
                expect(UL.comparePartial(matcher)({ b: 'c' })).toBe(true);

                // @ts-expect-error
                expect(UL.comparePartial(matcher)({ b: 10 })).toBeDefined();

                // @ts-expect-error
                expect(UL.comparePartial(matcher)({ h: 10 })).toBeDefined();
            });

            it('Match with nested objects and multiple conditions', () =>{
                const matcher = {
                    b: {
                        c: (x: string) => x === 'c',
                        d: { e: (x: number) => x < 100 }
                    }
                };

                expect(UL.comparePartial(matcher)({ b: { c: 'c', d: { e: 1000, f: 'f' } } })).toBe(false);
                expect(UL.comparePartial(matcher)({ b: { c: 'c', d: { e: 10, f: 'f' } } })).toBe(true);

                // @ts-expect-error
                expect(UL.comparePartial(matcher)({ b: { c: 'c', h: { e: 10, f: 'f', g: 'g' } } })).toBeDefined();
            });

            it('Match with arrays', () =>{
                const matcherSimple = { b: { [UL.$all]: (x: number) => x > 10 } };
                const matcherSimpleUtil = { b: UL.matchAll((x: number) => x > 10) };

                expect(UL.comparePartial(matcherSimple)({ b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })).toBe(false);
                expect(UL.comparePartial(matcherSimpleUtil)({ b: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })).toBe(false);

                expect(UL.comparePartial(matcherSimple)({ b: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] })).toBe(true);
                expect(UL.comparePartial(matcherSimpleUtil)({ b: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] })).toBe(true);

                const matcherNested = { b: { [UL.$all]: { f: 'f' } } }
                const matcherNestedUtils = { b: UL.matchAll({ f: 'f' }) }

                expect(UL.comparePartial(matcherNested)({ b: [{ f: 'f', g: 10 }, { f: 'g', g: 101 }] })).toBe(false);
                expect(UL.comparePartial(matcherNestedUtils)({ b: [{ f: 'f', g: 10 }, { f: 'f', g: 101 }] })).toBe(true);

                const matcherNestedUtils2 = { b: UL.matchAll({ g: (x: number) => x > 10 }) }
                expect(UL.comparePartial(matcherNestedUtils2)({ b: [{ f: 'f', g: 11 }, { f: 'f', g: 101 }] })).toBe(true);
                expect(UL.comparePartial(matcherNestedUtils2)({ b: [{ f: 'f', g: 9 }, { f: 'f', g: 101 }] })).toBe(false);

                const matcherNestedUtils3 = { b: UL.matchAll({ g: UL.matchAll((x: number) => x > 10) }) }
                expect(UL.comparePartial(matcherNestedUtils3)({ b: [{ f: 'f', g: [11] }, { f: 'f', g: [101] }] })).toBe(true);
                expect(UL.comparePartial(matcherNestedUtils3)({ b: [{ f: 'f', g: [9] }, { f: 'f', g: [101] }] })).toBe(false);

                const matcherNestedUtilsAny = { b: UL.matchAny((x: number) => x > 10) }
                expect(UL.comparePartial(matcherNestedUtilsAny)({ b: [7, 8, 9, 10, 11] })).toBe(true);
                expect(UL.comparePartial(matcherNestedUtilsAny)({ b: [7, 8, 9, 10] })).toBe(false);
            });
        })

        it('object is equal to the expected object, false otherwise', () => {
            const expected = {a: 1, b: 2, c: 3};

            const validMatcher = {a: 1, b: 2, c: 3};
            expect(UL.comparePartial(validMatcher)(expected)).toBe(true);

            const invalidMatcher = {a: 1, b: 2, c: 4};
            expect(UL.comparePartial(invalidMatcher)(expected)).toBe(false);
        });

        it('Returns true if the partial matcher object is equal to a subset of the expected object, false otherwise', () => {
            const expected = {a: 1, b: 2, c: 3};

            const validMatcher = {a: 1, b: 2};
            expect(UL.comparePartial(validMatcher)(expected)).toBe(true);

            const invalidMatcher = {a: 1, b: 2, c: 4};
            expect(UL.comparePartial(invalidMatcher)(expected)).toBe(false);
        });

        it('Works with deeply nested partial objects', () => {
            const expected = {a: 1, b: {c: 2, d: {e: {f: {g: 3}}}}};

            const validMatcher = {a: 1, b: {d: {e: {f: {g: 3}}}}};
            expect(UL.comparePartial(validMatcher)(expected)).toBe(true);

            const invalidMatcher = {a: 1, b: {d: {e: {f: {g: 10}}}}};
            expect(UL.comparePartial(invalidMatcher)(expected)).toBe(false);
        });

        it('Works with primitive types', () => {
            const expectedNumber = 1;
            expect(UL.comparePartial(1)(expectedNumber)).toBe(true);
            expect(UL.comparePartial(2)(expectedNumber)).toBe(false);

            const expectedString = '1';
            expect(UL.comparePartial('1')(expectedString)).toBe(true);
            expect(UL.comparePartial('2')(expectedString)).toBe(false);

            const expectedBoolean = true;
            expect(UL.comparePartial(true)(expectedBoolean)).toBe(true);
            expect(UL.comparePartial(false)(expectedBoolean)).toBe(false);

            const expectedArray = [1, 2, 3];
            expect(UL.comparePartial([1, 2, 3])(expectedArray)).toBe(true);
            expect(UL.comparePartial([1, 2, 4])(expectedArray)).toBe(false);

            const expectedDate = new Date();
            expect(UL.comparePartial(new Date())(expectedDate)).toBe(true);
            expect(UL.comparePartial(new Date('2020-01-01'))(expectedDate)).toBe(false);

            const expectedSymbol = Symbol('a');
            expect(UL.comparePartial(Symbol('a'))(expectedSymbol)).toBe(true);
            expect(UL.comparePartial(Symbol('b'))(expectedSymbol)).toBe(false);
        })
    })

    describe('get/set/mod', () => {
        it('Gets the value at the given path', () => {
            const obj = {a: {b: {c: 'hello'}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c');
            expect(lens.get(obj)).toBe('hello');

            const lens2 = UL.uber<Obj>()('a', 'b');
            expect(lens2.get(obj)).toEqual({c: 'hello'});

            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual({a: {b: {c: 'world'}}});

            const newObj2 = lens.mod(x => x + '!')(obj);
            expect(newObj2).toEqual({a: {b: {c: 'hello!'}}});
        });

        it('Gets the value at the given path with nested arrays', () => {
            const obj = {a: {b: {c: ['hello']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', 0);
            expect(lens.get(obj)).toBe('hello');

            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual({a: {b: {c: ['world']}}});

            const newObj2 = lens.mod(x => x + '!')(obj);
            expect(newObj2).toEqual({a: {b: {c: ['hello!']}}});
        });

        it('Returns undefined if the path doesn\'t exists in the nested array, the set/mod are skipped', () => {
            const obj = {a: {b: {c: ['hello']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', 1);
            expect(lens.get(obj)).toBeUndefined();

            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual(obj);

            const newObj2 = lens.mod(x => x + '!')(obj);
            expect(newObj2).toEqual(obj);
        });

        it('Fails the compilation if the path is not valid' , () => {
            const obj = {a: {b: {c: 'hello'}}};
            type Obj = typeof obj;

            // @ts-expect-error
            const lens = UL.uber<Obj>()('a', 'b', 'c', 'd');
            expect(lens.get(obj)).toBeUndefined();
        });

        it('matches a single elements in the path with nested arrays using the matchOne utils', () => {
            const obj = {a: {b: {c: ['hello', 'hello', 'world']}}};
            type Obj = typeof obj;

            // @ts-expect-error
            const lensInvalid1 = UL.uber<Obj>()('a', 'b', 'c', UL.indexOne(['hello']));
            // @ts-expect-error
            const lensInvalid2 = UL.uber<Obj>()('a', 'b', 'c', UL.indexOne(2));
            const lens = UL.uber<Obj>()('a', 'b', 'c', UL.indexOne('hello'));
            expect(lens.get(obj)).toBe('hello');

            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual({a: {b: {c: ['world', 'hello', 'world']}}});
        });

        it('Matches a single object in the path with nested arrays using the matchOne utils', () => {
            const obj = {a: {b: [{c: 'hello'}]}};
            type Obj = typeof obj;

            // @ts-expect-error
            const lensInvalid = UL.uber<Obj>()('a', 'b', 'c', UL.indexOne({c: 'hello'}));
            const lens = UL.uber<Obj>()('a', 'b', UL.indexOne({c: 'hello'}));
            expect(lens.get(obj)).toEqual({c: 'hello'});

            const newObj = lens.set(obj)({c: 'world'});
            expect(newObj).toEqual({a: {b: [{c: 'world'}]}});
        });

        it('Matches multiple elements in the path with nested arrays using the matchMany utils', () => {
            const obj = {a: {b: {c: ['hello', 'world']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', UL.indexMany('hello'));
            expect(lens.get(obj)).toEqual(['hello']);

        });

        it('Matches multiple elements in the path with nested arrays using the matchMany utils', () => {
            const obj = {a: {b: [{c: 'hello', d: 10}, {c: 'world', d: 20}, {c: 'hello', d: 200}]}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', UL.indexMany({d: (x: number) => x < 100}), 'c');
            expect(lens.get(obj)).toEqual(['hello', 'world']);

            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual({a: {b: [{c: 'world', d: 10}, {c: 'world', d: 20}, {c: 'hello', d: 200}]}});

            const newObj2 = lens.mod(x => x + '!')(obj);
            expect(newObj2).toEqual({a: {b: [{c: 'hello!', d: 10}, {c: 'world!', d: 20}, {c: 'hello', d: 200}]}});
        });

        it('Gets the element with the maximum/maximum value by prop', () => {
            const obj = {a: {b: [{c: 0}, {c: 100}]}};
            type Obj = typeof obj;

            const lensMin = UL.uber<Obj>()('a', 'b', UL.maxByProp('c'));
            expect(lensMin.get(obj)).toEqual({c: 100});

            const lensMax = UL.uber<Obj>()('a', 'b', UL.minByProp('c'));
            expect(lensMax.get(obj)).toEqual({c: 0});
        });

        it('Gets the element with the maximum/maximum value by extract function', () => {
            const obj = {a: {b: [{c: 0}, {c: 100}, {c: -200}]}};
            type Obj = typeof obj;

            const lensMin = UL.uber<Obj>()('a', 'b', UL.maxBy((o: {c: number}) => Math.abs(o.c)));
            expect(lensMin.get(obj)).toEqual({c: -200});

            const newObj = lensMin.set(obj)({c: -1000});
            expect(newObj).toEqual({a: {b: [{c: 0}, {c: 100}, {c: -1000}]}});

            const lensMax = UL.uber<Obj>()('a', 'b', UL.minBy((o: {c: number}) => Math.abs(o.c)));
            expect(lensMax.get(obj)).toEqual({c: 0});

            const newObj2 = lensMax.set(obj)({c: 1000});
            expect(newObj2).toEqual({a: {b: [{c: 1000}, {c: 100}, {c: -200}]}});
        });

        it('Gets an element in an extremely deep properties', () => {
            let deepObject = { A: { B: { C: { D: { E: { F: { G: { H: { I: { J: 100 } } } } } } } } } };

            type DeepObject = typeof deepObject;

            const testDeep = UL.uber<DeepObject>()('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J');

            expect(testDeep.get(deepObject)).toEqual(100);

            const newDeepObject = testDeep.set(deepObject)(200);
            expect(newDeepObject).toEqual({ A: { B: { C: { D: { E: { F: { G: { H: { I: { J: 200 } } } } } } } } } });

            const newDeepObject2 = testDeep.mod(x => x + 1)(deepObject);
            expect(newDeepObject2).toEqual({ A: { B: { C: { D: { E: { F: { G: { H: { I: { J: 101 } } } } } } } } } });
        });
    });
});
