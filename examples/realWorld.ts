import * as UL from "../src";

type Store = {
    user: string,
    posts: {
        title: string,
        comments: {
            user: string,
            text: string,
            likes: number
        }[]
    }[]
}

const store = {
    user: 'John',
    posts: [
        {
            title: 'Hello World',
            comments: [
                { user: 'Jane', text: 'Hello John',     likes: 10 },
                { user: 'Über', text: 'Guttentag John', likes: 200 }
            ]
        }
    ]
}

const uberLens = UL.uber<Store>()('posts', 0, 'comments', UL.indexOne({ user: 'Über' }), 'text');

// Now we just have to update the store
const newStore2 = uberLens.mod(t => t?.toUpperCase())(store)


// But we can also just get the value
const uberComment = uberLens.get(store)

// But we can also just set the value
const newStore3 = uberLens.set(store, 'Über is the best')

const uberCommentsLens = UL.uber<Store>()(
    'posts',
    UL.indexAll,
    'comments',
    UL.indexMany({ user: 'Über' }),
    'text'
);

const mostLikedCommentsLens = UL.uber<Store>()(
    'posts',
    UL.indexAll,
    'comments',
    UL.indexMany({ likes: (l: number) => l > 10 }),
    'text'
);

const mostCommentsLens = UL.uber<Store>()(
    'posts',
    UL.maxBy((c: {comments: any[]}) => c.comments.length),
);

// if you try to update a string with a number, you'll get a compile error.
// @ts-expect-error
const titleLens = UL.uber<Store>()('posts', 0, 'title').mod(t => t - 1); // Error!

// If you use the wrong path, you'll get a compile error.
// @ts-expect-error
const uberLens2 = UL.uber<Store>()('posts', 0, 'titles'); // Error!