/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Yoga from 'yoga-layout';

function createTreeWithThrowingMeasureFunc(depth: number) {
  const root = Yoga.Node.create();
  let parent = root;
  for (let i = 0; i < depth; i++) {
    const child = Yoga.Node.create();
    parent.insertChild(child, 0);
    parent = child;
  }

  const leaf = Yoga.Node.create();
  leaf.setMeasureFunc(() => {
    throw new Error('measure failed');
  });
  parent.insertChild(leaf, 0);

  return root;
}

test('measure_func_exception_propagates_to_caller', () => {
  const root = createTreeWithThrowingMeasureFunc(0);

  expect(() =>
    root.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR),
  ).toThrow('measure failed');
});

test('layout_works_after_repeated_measure_func_exceptions', () => {
  for (let i = 0; i < 1000; i++) {
    const root = createTreeWithThrowingMeasureFunc(20);
    expect(() =>
      root.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR),
    ).toThrow('measure failed');
  }

  const root = Yoga.Node.create();
  root.setWidth(100);
  root.setHeight(100);
  root.setAlignItems(Yoga.ALIGN_FLEX_START);

  const root_child0 = Yoga.Node.create();
  root_child0.setMeasureFunc(() => ({width: 10, height: 10}));
  root.insertChild(root_child0, 0);
  root.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);

  expect(root_child0.getComputedWidth()).toBe(10);
  expect(root_child0.getComputedHeight()).toBe(10);
});

test('node_is_measured_again_after_its_measure_func_threw', () => {
  let shouldThrow = true;

  const root = Yoga.Node.create();
  root.setWidth(100);
  root.setHeight(100);
  root.setAlignItems(Yoga.ALIGN_FLEX_START);

  const root_child0 = Yoga.Node.create();
  root_child0.setMeasureFunc(() => {
    if (shouldThrow) {
      throw new Error('measure failed');
    }
    return {width: 10, height: 20};
  });
  root.insertChild(root_child0, 0);

  expect(() =>
    root.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR),
  ).toThrow('measure failed');

  shouldThrow = false;
  root.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);

  expect(root_child0.getComputedWidth()).toBe(10);
  expect(root_child0.getComputedHeight()).toBe(20);
});
