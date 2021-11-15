import * as UL from '../src/index';

describe('Uber lens', () => {
    describe('get', () => {
        it('should get the value at the given path', () => {
            const obj = {a: {b: {c: 'hello'}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c');
            expect(lens.get(obj)).toBe('hello');

            const lens2 = UL.uber<Obj>()('a', 'b');
            expect(lens2.get(obj)).toEqual({c: 'hello'});
        });

        it('should get the value at the given path with nested arrays', () => {
            const obj = {a: {b: {c: ['hello']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', 0);
            expect(lens.get(obj)).toBe('hello');
        });

        it('should return undefined if the path doesn\'t exists in the nested array', () => {
            const obj = {a: {b: {c: ['hello']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', 1);
            expect(lens.get(obj)).toBeUndefined();
        });

        it('fails the compilation if the path is not valid' , () => {
            const obj = {a: {b: {c: 'hello'}}};
            type Obj = typeof obj;

            // @ts-expect-error
            const lens = UL.uber<Obj>()('a', 'b', 'c', 'd');
            expect(lens.get(obj)).toBeUndefined();
        });

        // it('matches a single elements in the path with nested arrays using the matchOne utils', () => {
        //     const obj = {a: {b: {c: ['hello']}}};
        //     type Obj = typeof obj;
        //
        //     // @ts-expect-error
        //     const lensInvalid1 = UL.uber<Obj>()('a', 'b', 'c', UL.matchOne(['hello']));
        //     // @ts-expect-error
        //     const lensInvalid2 = UL.uber<Obj>()('a', 'b', 'c', UL.matchOne(2));
        //     const lens = UL.uber<Obj>()('a', 'b', 'c', UL.matchOne('hello'));
        //     expect(lens.get(obj)).toBe('hello');
        // });

        it('matches a single object in the path with nested arrays using the matchOne utils', () => {
            const obj = {a: {b: [{c: 'hello'}]}};
            type Obj = typeof obj;

            // @ts-expect-error
            const lensInvalid = UL.uber<Obj>()('a', 'b', 'c', UL.matchOne({c: 'hello'}));
            const lens = UL.uber<Obj>()('a', 'b', UL.matchOne({c: 'hello'}));
            expect(lens.get(obj)).toEqual({c: 'hello'});
        });

        // it('Matches multiple elements in the path with nested arrays using the matchMany utils', () => {
        //     const obj = {a: {b: {c: ['hello', 'world']}}};
        //     type Obj = typeof obj;
        //
        //     const lens = UL.uber<Obj>()('a', 'b', 'c', UL.matchMany('hello'));
        //     expect(lens.get(obj)).toEqual(['hello']);
        // });

        it('Matches multiple elements in the path with nested arrays using the matchMany utils', () => {
            const obj = {a: {b: [{c: 'hello'}, {c: 'world'}]}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', UL.matchMany({c: 'hello'}));
            expect(lens.get(obj)).toEqual([{c: 'hello'}]);
        });
    });

    describe('set/mod', () => {
        it('should set the value at the given path', () => {
            const obj = {a: {b: {c: 'hello'}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c');
            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual({a: {b: {c: 'world'}}});

            const newObj2 = lens.mod(x => x + '!')(obj);
            expect(newObj2).toEqual({a: {b: {c: 'hello!'}}});
        });

        it('should set the value at the given path with nested arrays', () => {
            const obj = {a: {b: {c: ['hello']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', 0);
            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual({a: {b: {c: ['world']}}});

            const newObj2 = lens.mod(x => x + '!')(obj);
            expect(newObj2).toEqual({a: {b: {c: ['hello!']}}});
        });

        it('should do nothing if the path doesn\'t exists in the nested array', () => {
            const obj = {a: {b: {c: ['hello']}}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', 'c', 1);
            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual(obj);

            const newObj2 = lens.mod(x => x + '!')(obj);
            expect(newObj2).toEqual(obj);
        });

        it('should update the value of nested arrays with the matchOne utils', () => {
            const obj = {a: {b: [{c: 'hello'}, {c: 'world'}]}};
            type Obj = typeof obj;

            const lens = UL.uber<Obj>()('a', 'b', UL.matchOne({c: 'hello'}), 'c');
            const newObj = lens.set(obj)('world');
            expect(newObj).toEqual({a: {b: [{c: 'world'}, {c: 'world'}]}});

            const newObj2 = lens.mod(x => x + '!')(obj);
            expect(newObj2).toEqual({a: {b: [{c: 'hello!'}, {c: 'world!'}]}});
        });
    });
});
