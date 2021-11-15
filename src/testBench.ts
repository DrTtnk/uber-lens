import UL from "./";

export type Translation<T> = { isoCode: string; value: T };

export type TranslatableSingle<T> = { single: T };
export type TranslatableMulti<T> = { multi: Translation<T>[] };
export type Translatable<T> = TranslatableSingle<T> | TranslatableMulti<T>;

export type Code<T extends string> = string & { [brand in `__${T}_code`]: never };
export type ID<T extends string> = string & { [brand in `__id_${T}`]: never };

export type GroupCode = Code<'group'>;
export type ContentTypeCode = Code<'content_type'>;

export type NodeId = ID<'node'>;

export type ProductInfoS = {
    _id: ID<'product_info'>;
    code: string;
    hierarchies: NodeS[];
    contentTypeGroups: {
        group: GroupCode;
        name: TranslatableMulti<string>;
        role: string;
        contentTypes: ContentTypeS[];
    }[];
};

export type ContentTypeChildS = Exclude<ContentTypeS, { type: 'array' }>;
export type ContentTypeBase = {
    code: ContentTypeCode;
    group: GroupCode;
    name: TranslatableMulti<string>;
    required: boolean;
};
export type ContentTypeS = ContentTypeBase & (
    | { multiLanguage: boolean; type: 'text' }
    | { multiLanguage: boolean; type: 'html' }
    | { multiLanguage: boolean; type: 'file' }
    | { type: 'number' }
    | { multiLanguage: boolean; type: 'image'; isMainImage: boolean }
    | { type: 'measure'; kind: string }
    | { type: 'array'; children: ContentTypeChildS[] }
    | { type: 'link'; hierarchy: NodeId }
    | {
        type: 'select';
        multiLanguage: boolean;
        isMultiSelect: boolean;
        selectOptions: { code: string; label: Translatable<string> }[];
    }
);

export type GroupStatus = 'approved' | 'new' | 'dirty';
export type ContentGroupS = {
    group: GroupCode;
    contents: ContentS[];
    status: GroupStatus;
};

export type NodeS = AncestorS | LeafS;
export type AncestorS = LeafS & { nodes: NodeS[] };
export type LeafS = {
    _id: NodeId;
    code: string;
    groups: ContentGroupS[];
};

export type MediaS = { uri: string; filename: string };

export type ContentChildS = Exclude<ContentS, { type: 'array' } | { type: 'inherited' }>;
export type ContentBase = { code: ContentTypeCode; group: GroupCode };
export type ContentS = ContentBase & (
    // | { type: 'inherited' }
    | { type: 'text'; value: Translatable<string> }
    | { type: 'html'; value: Translatable<string> }
    | { type: 'file'; value: Translatable<MediaS> }
    | { type: 'image'; value: Translatable<MediaS> }
    | { type: 'array'; children: ContentChildS[][] }
    | { type: 'number'; value: number }
    | { type: 'link'; value: NodeId }
    | { type: 'measure'; value: number }
    | { type: 'select'; value: string | string[] }
);

const pimPieceDeep = UL.uber<ProductInfoS>()(
    'hierarchies',
    0,
    'groups',
    UL.indexOne({ group: 'product_info' }),
    'contents',
    UL.indexAll,
    'children'
)

const pimPieceDeepR = UL.uber<ProductInfoS>()(
    'hierarchies',
    0,
    'groups',
    0,
    'contents',
    0,
    'value',
)

const deepArray = UL.uber<string[][][][][][]>()(
    { single: c => !!c.length },
    { single: c => !!c.length },
    { single: c => !!c.length },
    { single: c => !!c.length },
    { single: c => !!c.length },
    { single: c => !!c.length },
)

const productInfoExample: ProductInfoS = {
    _id: 'product_info' as ID<'product_info'>,
    code: 'product_info',
    contentTypeGroups: [
        {
            group: 'product_info'as GroupCode,
            contentTypes: [],
            name: {
                multi: [
                    {isoCode: 'en', value: 'Product Info',},
                    {isoCode: 'ru', value: 'Информация о товаре',},
                ]
            },
            role: 'main',

        }
    ],
    hierarchies: [
        {
            _id: 'hierarchy_1' as NodeId,
            code: 'hierarchy_1',
            groups: [
                {
                    group: 'group_1' as GroupCode,
                    contents: [],
                    status: 'approved',
                },
                {
                    group: 'group_2' as GroupCode,
                    contents: [],
                    status: 'new',
                },
            ],
        },
    ],
};

const simpleObject = {
    a: 1,
    b: 2,
    c: {d: 3, e: 4,},
    d: [
        {e: 9, f: '10',},
        {e: 5, f: '8',},
        {e: 7, f: '8',},
    ],
};

const simplePimLens = UL.uber<ProductInfoS>()(
    'hierarchies',
    0,
    'groups',
    UL.indexOne({ group: 'product_info' }),
    'contents',
    UL.indexAll,
    'children',
    UL.indexAll,
    { single: x => x.type === 'text' },
    'value',
    'multi',
);
type SimpleObject = typeof simpleObject;

const simpleObjectSet = UL.uber<SimpleObject>()(
    "d",
    UL.indexOne({ e: (e: number) => e > 50, f: '8' }),
    "f"
).mod(n => `Greater ${n}`)(simpleObject);

const pimPieceShallow2 = UL.uber<ProductInfoS>()(
    "contentTypeGroups",
    UL.indexAll,
    "name",
    "multi",
    UL.indexOne({ isoCode: "en" }),
    "value"
).mod(() => "Mimmo")(productInfoExample)

console.log(pimPieceShallow2);

const pimPiece2 = UL.uber<Translatable<string>[]>()(
    0,
    'multi',
    UL.indexOne({ isoCode: 'en' }),
)

