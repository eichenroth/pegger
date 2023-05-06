/* eslint-env jest */

import * as p from '../src/index.ts';

test('string match test', () => {
  const grammar = p.string('match_me');

  expect(grammar.match('match_me')).toBe(true);
  expect(grammar.match('match_me_please')).toBe(true);

  expect(grammar.match('dont_match_me')).toBe(false);
});

test('char match test', () => {
  const grammar = p.char(['a', 'z']);

  expect(grammar.match('a')).toBe(true);
  expect(grammar.match('m')).toBe(true);
  expect(grammar.match('z')).toBe(true);
  expect(grammar.match('A')).toBe(false);
  expect(grammar.match('M')).toBe(false);
  expect(grammar.match('Z')).toBe(false);

  const grammar2 = p.char(['a', 'z'], 'M');

  expect(grammar2.match('a')).toBe(true);
  expect(grammar2.match('m')).toBe(true);
  expect(grammar2.match('z')).toBe(true);
  expect(grammar2.match('A')).toBe(false);
  expect(grammar2.match('M')).toBe(true);
  expect(grammar2.match('Z')).toBe(false);
});

test('any match test', () => {
  const grammar = p.any();

  expect(grammar.match('a')).toBe(true);
  expect(grammar.match('0')).toBe(true);
  expect(grammar.match('')).toBe(false);
});

test('opt match test', () => {
  const grammar = p.opt(p.string('match_me'));

  expect(grammar.match('match_me')).toBe(true);
  expect(grammar.match('match_me_please')).toBe(true);
  expect(grammar.match('dont_match_me')).toBe(true);
});

test('zeroPlus match test', () => {
  const grammar = p.zeroPlus(p.string('match_me'));

  expect(grammar.match('match_me')).toBe(true);
  expect(grammar.match('match_me_please')).toBe(true);
  expect(grammar.match('match_mematch_me')).toBe(true);
  expect(grammar.match('dont_match_me')).toBe(true);
});

test('onePlus match test', () => {
  const grammar = p.onePlus(p.string('match_me'));

  expect(grammar.match('match_me')).toBe(true);
  expect(grammar.match('match_me_please')).toBe(true);
  expect(grammar.match('match_mematch_me')).toBe(true);
  expect(grammar.match('dont_match_me')).toBe(false);
});

test('and match test', () => {
  const grammar = p.and(p.string('match_me'));

  expect(grammar.match('match_me')).toBe(true);
  expect(grammar.match('match_me_please')).toBe(true);
  expect(grammar.match('dont_match_me')).toBe(false);
});

test('not match test', () => {
  const grammar = p.not(p.string('match_me'));

  expect(grammar.match('match_me')).toBe(false);
  expect(grammar.match('match_me_please')).toBe(false);
  expect(grammar.match('dont_match_me')).toBe(true);
});

test('seq match test', () => {
  const grammar = p.seq([p.string('match_me'), p.string('_please')]);

  expect(grammar.match('match_me_please')).toBe(true);
  expect(grammar.match('match_me')).toBe(false);
});

test('choice match test', () => {
  const grammar = p.choice([p.string('match_me'), p.string('please_match_me')]);

  expect(grammar.match('match_me')).toBe(true);
  expect(grammar.match('please_match_me')).toBe(true);
  expect(grammar.match('dont_match_me')).toBe(false);
});
