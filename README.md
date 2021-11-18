# UBER LENS

---

### <div style="text-align: center;">Immutable data made easy</div>

---

Have you ever wanted to see the whole picture of your data?

Have you ever wanted to use only immutable data?

Have you ever wanted to do it in a way that is easy to understand?

Have you ever wanted to do it in a way that is easy to use?

Look no further, UBER LENS is here to help you.

## Table of Contents

 - [Installation](#installation)
 - [What is UBER LENS?](#what-is-uber-lens)
   - [Before Uber-lens](#the-old-way) 
   - [After Uber-lens](#the-new-way)
 - [Typing](#typing)
 - [Api](#api)
   - [uber](#uber)
   - [indexOne, indexMany, indexAll](#indexone-indexmany-indexall)
   - [maxBy, minBy, maxByProp, minByProp](#maxby-minby-maxbyprop-minbyprop)

## Installation

```shell
npm i uber-lens
```

## What is UBER LENS?

It's a library that allows you to create declarative and strongly typed lenses for your data.

### Motivations

I love functional programming, and I love declarative programming, and I really likes the [shades](https://www.npmjs.com/package/shades) package.

There is only one problem with then, it's type declarations are a [little verbose](https://github.com/jamesmcnamara/shades/blob/master/types/index.d.ts), to say the least, and with some missing cases.

Uber-lens allows you to create declarative, lodash like and strongly typed lenses for your data with less than 200 lines of library code
with all the benefits of powerful type declarations.

### The old way

This is a very basic nested data structure
```typescript
const store = {
    user: 'John',
    posts: [
        {
            title: 'Hello World',
            comments: [
                {
                    user: 'Jane',
                    text: 'Hello John',
                    likes: 10
                },
                {
                    user: 'Über',
                    text: 'Guttentag John',
                    likes: 200
                }
            ]
        }
    ]
}
```

We want to update Über's comment to be all uppercase in the old way.
```typescript
// Capitalize Über's comment
const newStore = {
    ...store,
    posts: store.posts.map(post => ({
        ...post,
        comments: post.comments.map(comment => comment.user === 'Über'
            ? { ...comment, text: comment.text.toUpperCase() }
            : comment)
    }))
}
```

I'm not even sure if this works, and I'm too scared to try it :D

### The new way

Let's try it with UBER LENS!

```typescript
import * as UL from 'uber-lens'

type Store = typeof store

const uberLens = UL.uber<Store>()('posts', 0, 'comments', UL.indexOne({ user: 'Über' }), 'text');

// Now we just have to update the store
const newStore = uberLens.mod(t => t.toUpperCase())(store)
```

See? It's that easy!

---

```typescript
// But we can also just get the value
const uberComment = uberLens.get(store)

// But we can also just set the value
const newStore3 = uberLens.set(store, 'Über is the best')
```

I'll let you guess if this works as expected, but the tests and the EXTREMELY STRONG TYPE system are here to make sure 
you don't mess up.

---

## But wait! There is more!

Not only UBER LENS can make your life easier when making simple updates, it can also make your life easier when making
complex updates.

---

Do you want to set/update/get **all** Über comments to be all uppercase? You can do that with UBER LENS!
```typescript
import * as UL from 'uber-lens'
const uberCommentsLens = UL.uber<Store>()(
    'posts',
    UL.indexAll,
    'comments',
    UL.indexMany({ user: 'Über' }),
    'text'
);
```
---
Do you want to set/update/get only the comments that have more than 10 likes? Done!
```typescript
import * as UL from 'uber-lens'

const mostLikedCommentsLens = UL.uber<Store>()(
    'posts',
    UL.indexAll,
    'comments',
    UL.indexMany({ likes: (l: number) => l > 10 }),
    'text'
);
```
---
Do you want the text of the post with the most comments? Done!
```typescript
import * as UL from 'uber-lens'

const mostCommentsLens = UL.uber<Store>()(
    'posts',
    UL.maxBy((c: {comments: any[]}) => c.comments.length),
);
```
---
## Typing

This is the sweetest part, everything is typed! And I mean everything is **strongly** typed.

If you mess up, and you use the wrong type, you'll get a compile-time error.

The wrong path? Compile time error.

The wrong value? Compile error.

The wrong update function? Compile error.

For instance: 
```typescript
import * as UL from 'uber-lens'

// if you try to update a string with a number, you'll get a compile error.
const titleUpdate = UL.uber<Store>()('posts', 0, 'title').mod(t => t - 1); // Error!

// If you use the wrong path, you'll get a compile error.
const uberLens2 = UL.uber<Store>()('posts', 0, 'titles'); // Error!
```

---

# Api

### uber
```typescript
// Not the real prototype, but it's the same
export function uber<Obj extends object>(): <P extends Indexer<Obj>[]>(...indexers: P) => {
    get: (obj: Obj) => Get<P, Obj>;
    set: (obj: Obj, value: Get<P, Obj>) => Obj;
    mod: (obj: Obj) => (update: (t: Get<P, Obj>) => Get<P, Obj>) => Obj;
}
```

---

### indexOne, indexMany, indexAll
```typescript
export function indexOne: <T>(match: Comparer<T>) => { single: <S extends T>(obj: S) => boolean };
export function indexMany: <T>(match: Comparer<T>) => { multi: <S extends T>(obj: S) => boolean };
export function indexAll: () => { multi: <T>(_: T) => boolean };
```

---

### maxBy, minBy, maxByProp, minByProp
```typescript

export function maxBy: <T>(extract: (el: T) => number) => { fold: Index<T[]> };
export function minBy: <T>(extract: (el: T) => number) => { fold: Index<T[]> };

export function maxByProp: <K extends string, T extends Record<K, number>>(prop: K) => { fold: Index<T[]> };
export function minByProp: <K extends string, T extends Record<K, number>>(prop: K) => { fold: Index<T[]> };
```
