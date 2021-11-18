import * as UL from "../src";

type DeeplyNestedArray = number[][][][][][][][][][][];

const deeplyNestsArray: DeeplyNestedArray = [[[[[[[[[[[10, 20, 30]]]]]]]]]]]

const deeplyNestedLens = UL.uber<DeeplyNestedArray>()(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

const deeplyNestedLensGet    = deeplyNestedLens.get(deeplyNestsArray); // 10
const deeplyNestedLensSet    = deeplyNestedLens.set(deeplyNestsArray, 100);
// [ [[[[[[[[[[100, 20, 30]]]]]]]]]]]]
const deeplyNestedLensUpdate = deeplyNestedLens.mod(v => v && v + 3)(deeplyNestsArray);
// [ [[[[[[[[[[13, 20, 30]]]]]]]]]]]]

const deeplyNestedLens2 = UL.uber<DeeplyNestedArray>()(
    UL.indexAll,
    UL.indexAll,
    UL.indexAll,
    UL.indexAll,
    UL.indexAll,
    UL.indexAll,
    UL.indexAll,
    UL.indexAll,
    UL.indexAll,
    UL.indexAll,
    UL.indexAll
)

const deeplyNestedLens2Get    = deeplyNestedLens2.get(deeplyNestsArray); // [10]

const deeplyNestedLens2Set    = deeplyNestedLens2.set(deeplyNestsArray, 100);
// [ [[[[[[[[[[100, 100, 100]]]]]]]]]]]]

const deeplyNestedLens2Update = deeplyNestedLens2.mod(v => v && v + 3)(deeplyNestsArray);
// [ [[[[[[[[[[13, 23, 33]]]]]]]]]]]]