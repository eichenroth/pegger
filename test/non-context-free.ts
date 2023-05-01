import test from 'tape';
import * as p from '../src/index.ts';

// Classic non-context-free grammar: {a^n b^n c^n | n >= 1}
// copied from https://en.wikipedia.org/wiki/Parsing_expression_grammar

// S := &(A 'c') 'a'+ B !.
// A := 'a' A? 'b'
// B := 'b' B? 'c'

const grammar = p.grammar({
  S: p.seq([
    p.and(p.seq([p.alias('A'), p.string('c')])),
    p.onePlus(p.string('a')),
    p.alias('B'),
    p.not(p.any()),
  ]),
  A: p.seq([
    p.string('a'),
    p.opt(p.alias('A')),
    p.string('b'),
  ]),
  B: p.seq([
    p.string('b'),
    p.opt(p.alias('B')),
    p.string('c'),
  ]),
});

test('non-context-free', (t) => {
  t.equal(grammar.rules.S.match(''), false);

  t.equal(grammar.rules.S.match('abc'), true);
  t.equal(grammar.rules.S.match('aaaabbbbcccc'), true);

  t.equal(grammar.rules.S.match('ab'), false);
  t.equal(grammar.rules.S.match('abab'), false);
  t.equal(grammar.rules.S.match('abcd'), false);
  t.equal(grammar.rules.S.match('aabbc'), false);
  t.equal(grammar.rules.S.match('aabbccc'), false);

  t.end();
});
