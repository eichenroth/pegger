import test from 'tape';
import * as p from '../src/index.ts';

test('parse all', (t) => {
  const grammar = p.string('match_me');

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('match_me_please'), true);
  t.equal(grammar.match('dont_match_me'), false);

  t.equal(grammar.parse('match_me').success, true);
  t.equal(grammar.parse('match_me_please').success, true);
  t.equal(grammar.parse('dont_match_me').success, false);

  t.equal(grammar.matchAll('match_me'), true);
  t.equal(grammar.matchAll('match_me_please'), false);
  t.equal(grammar.matchAll('dont_match_me'), false);

  t.equal(grammar.parseAll('match_me').success, true);
  t.equal(grammar.parseAll('match_me_please').success, false);
  t.equal(grammar.parseAll('dont_match_me').success, false);

  t.end();
});
