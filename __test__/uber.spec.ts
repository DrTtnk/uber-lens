import * as UL from '../src/index';

describe('Uber lens', () => {

    describe('matchers', () => {

        describe('matchers with logic', () => {
            it('Returns true if the matcher function matches primitive types, false otherwise', () =>{
                const matcher = (x: string) => x === 'a';
                expect(UL.comparePartial(matcher)('a')).toBe(true);
                expect(UL.comparePartial(matcher)('b')).toBe(false);

                // @ts-expect-error
                expect(UL.comparePartial(matcher)(10)).toBeDefined();
            });

            it('Returns true if the matcher function matches objects, false otherwise', () =>{
                const matcher = (x: { a: string }) => x.a === 'a';
                expect(UL.comparePartial(matcher)({ a: 'a' })).toBe(true);
                expect(UL.comparePartial(matcher)({ a: 'b' })).toBe(false);

                // @ts-expect-error
                expect(UL.comparePartial(matcher)({ a: 10 })).toBeDefined();
            });

            it('Returns true if the matcher function matches with nested functions, false otherwise', () =>{
                const matcher = { b: (x: string) => x === 'c' };
                expect(UL.comparePartial(matcher)({ b: 'b' })).toBe(false);
                expect(UL.comparePartial(matcher)({ b: 'c' })).toBe(true);

                // @ts-expect-error
                expect(UL.comparePartial(matcher)({ b: 10 })).toBeDefined();

                // @ts-expect-error
                expect(UL.comparePartial(matcher)({ h: 10 })).toBeDefined();
            });

            it('Returns true if the matcher function matches with nested objects and multiple conditions, false otherwise', () =>{
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

            it('Returns true if the matcher function matches with arrays, false otherwise', () =>{
                const matcher = { b: (x: string[]) => x.length === 2 };

                expect(UL.comparePartial(matcher)({ b: ['a', 'b'] })).toBe(true);
                expect(UL.comparePartial(matcher)({ b: ['a', 'b', 'c'] })).toBe(false);

                // @ts-expect-error
                expect(UL.comparePartial(matcher)({ b: ['a', 10] })).toBeDefined();
            });
        })

        it('Returns true if the matcher object is equal to the expected object, false otherwise', () => {
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
            expect(UL.comparePartial([1, 2])(expectedArray)).toBe(true);
            expect(UL.comparePartial([1, 2, 4])(expectedArray)).toBe(false);

            const expectedDate = new Date();
            expect(UL.comparePartial(new Date())(expectedDate)).toBe(true);
            expect(UL.comparePartial(new Date('2020-01-01'))(expectedDate)).toBe(false);

            const expectedSymbol = Symbol('a');
            expect(UL.comparePartial(Symbol('a'))(expectedSymbol)).toBe(true);
            expect(UL.comparePartial(Symbol('b'))(expectedSymbol)).toBe(false);
        })
    })

    describe('get', () => {
        it('Gets the value at the given path', () => {
            const obj = {a: {b: {c: 'hello'}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c');
            expect(lens.get(obj)).toBe('hello');

            const lens2 = UL.uber<Obj>()('a', 'b');
            expect(lens2.get(obj)).toEqual({c: 'hello'});
        });

        it('Gets the value at the given path with nested arrays', () => {
            const obj = {a: {b: {c: ['hello']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', 0);
            expect(lens.get(obj)).toBe('hello');
        });

        it('Returns undefined if the path doesn\'t exists in the nested array', () => {
            const obj = {a: {b: {c: ['hello']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', 1);
            expect(lens.get(obj)).toBeUndefined();
        });

        it('Fails the compilation if the path is not valid' , () => {
            const obj = {a: {b: {c: 'hello'}}};
            type Obj = typeof obj;

            // @ts-expect-error
            const lens = UL.uber<Obj>()('a', 'b', 'c', 'd');
            expect(lens.get(obj)).toBeUndefined();
        });

        it('matches a single elements in the path with nested arrays using the matchOne utils', () => {
            const obj = {a: {b: {c: ['hello']}}};
            type Obj = typeof obj;

            // @ts-expect-error
            const lensInvalid1 = UL.uber<Obj>()('a', 'b', 'c', UL.matchOne(['hello']));
            // @ts-expect-error
            const lensInvalid2 = UL.uber<Obj>()('a', 'b', 'c', UL.matchOne(2));
            const lens = UL.uber<Obj>()('a', 'b', 'c', UL.matchOne('hello'));
            expect(lens.get(obj)).toBe('hello');
        });

        it('Matches a single object in the path with nested arrays using the matchOne utils', () => {
            const obj = {a: {b: [{c: 'hello'}]}};
            type Obj = typeof obj;

            // @ts-expect-error
            const lensInvalid = UL.uber<Obj>()('a', 'b', 'c', UL.matchOne({c: 'hello'}));
            const lens = UL.uber<Obj>()('a', 'b', UL.matchOne({c: 'hello'}));
            expect(lens.get(obj)).toEqual({c: 'hello'});
        });

        it('Matches multiple elements in the path with nested arrays using the matchMany utils', () => {
            const obj = {a: {b: {c: ['hello', 'world']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', UL.matchMany('hello'));
            expect(lens.get(obj)).toEqual(['hello']);
        });

        it('Matches multiple elements in the path with nested arrays using the matchMany utils', () => {
            const obj = {a: {b: [{c: 'hello'}, {c: 'world'}]}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', UL.matchMany({c: 'hello'}));
            expect(lens.get(obj)).toEqual([{c: 'hello'}]);
        });
    });

    describe('set/mod', () => {
        it('Sets the value at the given path', () => {
            const obj = {a: {b: {c: 'hello'}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c');
            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual({a: {b: {c: 'world'}}});

            const newObj2 = lens.mod(x => x + '!')(obj);
            expect(newObj2).toEqual({a: {b: {c: 'hello!'}}});
        });

        it('Sets the value at the given path with nested arrays', () => {
            const obj = {a: {b: {c: ['hello']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', 0);
            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual({a: {b: {c: ['world']}}});

            const newObj2 = lens.mod(x => x + '!')(obj);
            expect(newObj2).toEqual({a: {b: {c: ['hello!']}}});
        });

        it('Does nothing if the path doesn\'t exists in the nested array', () => {
            const obj = {a: {b: {c: ['hello']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', 1);
            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual(obj);

            const newObj2 = lens.mod(x => x + '!')(obj);
            expect(newObj2).toEqual(obj);
        });

        // it('Updates the value of nested arrays with the matchOne utils', () => {
        //     const obj = {a: {b: [{c: 'hello'}, {c: 'world'}]}};
        //     type Obj = typeof obj;
        //
        //     const lens = UL.uber<Obj>()('a', 'b', UL.matchOne({c: 'hello'}), 'c');
        //     const newObj = lens.set(obj)('world');
        //     expect(newObj).toEqual({a: {b: [{c: 'world'}, {c: 'world'}]}});
        //
        //     const newObj2 = lens.mod(x => x + '!')(obj);
        //     expect(newObj2).toEqual({a: {b: [{c: 'hello!'}, {c: 'world!'}]}});
        // });
    });
});
