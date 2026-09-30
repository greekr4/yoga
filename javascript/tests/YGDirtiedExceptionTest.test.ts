/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Yoga from 'yoga-layout';

test('dirtied_func_exception_propagates_to_caller', () => {
  const root = Yoga.Node.create();
  root.setWidth(100);
  root.setHeight(100);
  root.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);

  root.setDirtiedFunc(() => {
    throw new Error('dirtied failed');
  });

  expect(() => root.setWidth(50)).toThrow('dirtied failed');
});

test('layout_works_after_repeated_dirtied_func_exceptions', () => {
  for (let i = 0; i < 10000; i++) {
    const root = Yoga.Node.create();
    const root_child0 = Yoga.Node.create();
    root_child0.setWidth(10);
    root_child0.setHeight(10);
    root.insertChild(root_child0, 0);
    root.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);

    root.setDirtiedFunc(() => {
      throw new Error('dirtied failed');
    });
    expect(() => root_child0.setWidth(20)).toThrow('dirtied failed');
  }

  const root = Yoga.Node.create();
  root.setWidth(100);
  root.setHeight(100);
  root.setAlignItems(Yoga.ALIGN_FLEX_START);

  const root_child0 = Yoga.Node.create();
  root_child0.setWidth(10);
  root_child0.setHeight(10);
  root.insertChild(root_child0, 0);
  root.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);

  expect(root_child0.getComputedWidth()).toBe(10);
  expect(root_child0.getComputedHeight()).toBe(10);
});

test('dirtied_func_exception_still_marks_ancestors_dirty', () => {
  const root = Yoga.Node.create();
  root.setAlignItems(Yoga.ALIGN_FLEX_START);
  root.setWidth(100);
  root.setHeight(100);

  const root_child0 = Yoga.Node.create();
  root_child0.setAlignItems(Yoga.ALIGN_FLEX_START);
  root.insertChild(root_child0, 0);

  const root_child0_child0 = Yoga.Node.create();
  root_child0_child0.setWidth(10);
  root_child0_child0.setHeight(10);
  root_child0.insertChild(root_child0_child0, 0);

  root.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);
  expect(root_child0.getComputedWidth()).toBe(10);

  root_child0.setDirtiedFunc(() => {
    throw new Error('dirtied failed');
  });

  expect(() => root_child0_child0.setWidth(30)).toThrow('dirtied failed');
  expect(root_child0_child0.isDirty()).toBe(true);
  expect(root_child0.isDirty()).toBe(true);
  expect(root.isDirty()).toBe(true);

  root_child0.setDirtiedFunc(null);
  root.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);

  expect(root_child0_child0.getComputedWidth()).toBe(30);
  expect(root_child0.getComputedWidth()).toBe(30);
});
