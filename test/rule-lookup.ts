import test from 'tape';
import * as p from '../src/index.ts';

test('grammar rule lookup', (t) => {
  const grammar = p.grammar({
    Rule: p.string('match_me'),
  });

  t.equal(grammar.rules.Rule.match('match_me'), true);
  t.equal(grammar.rules.Rule.match('match_me_please'), true);
  t.equal(grammar.rules.Rule.match('dont_match_me'), false);

  t.end();
});

test('grammar alias lookup', (t) => {
  const grammar = p.grammar({
    Rule: p.string('match_me'),
    AliasRule: p.alias('Rule'),
  });

  t.equal(grammar.rules.Rule.match('match_me'), true);
  t.equal(grammar.rules.Rule.match('match_me_please'), true);
  t.equal(grammar.rules.Rule.match('dont_match_me'), false);

  t.end();
});