/* eslint-env jest */

import * as p from '../src/index.ts';

test('parse all', () => {
  const grammar = p.string('match_me');

  expect(grammar.match('match_me')).toBe(true);
  expect(grammar.match('match_me_please')).toBe(true);
  expect(grammar.match('dont_match_me')).toBe(false);

  expect(grammar.parse('match_me').success).toBe(true);
  expect(grammar.parse('match_me_please').success).toBe(true);
  expect(grammar.parse('dont_match_me').success).toBe(false);

  expect(grammar.matchAll('match_me')).toBe(true);
  expect(grammar.matchAll('match_me_please')).toBe(false);
  expect(grammar.matchAll('dont_match_me')).toBe(false);

  expect(grammar.parseAll('match_me').success).toBe(true);
  expect(grammar.parseAll('match_me_please').success).toBe(false);
  expect(grammar.parseAll('dont_match_me').success).toBe(false);
});
