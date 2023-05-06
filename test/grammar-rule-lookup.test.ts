/* eslint-env jest */

import * as p from '../src/index.ts';

test('grammar rule lookup', () => {
  const grammar = p.grammar({
    Rule: p.string('match_me'),
  });

  expect(grammar.rules.Rule.match('match_me')).toBe(true);
  expect(grammar.rules.Rule.match('match_me_please')).toBe(true);
  expect(grammar.rules.Rule.match('dont_match_me')).toBe(false);
});

test('grammar alias lookup', () => {
  const grammar = p.grammar({
    Rule: p.string('match_me'),
    AliasRule: p.alias('Rule'),
  });

  expect(grammar.rules.Rule.match('match_me')).toBe(true);
  expect(grammar.rules.Rule.match('match_me_please')).toBe(true);
  expect(grammar.rules.Rule.match('dont_match_me')).toBe(false);
});
