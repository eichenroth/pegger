import test from "tape";
import * as p from '../src';

// <Base> := !. / &(<A>!"b")"a"*<B>!.
// <A> := "a" <A> "b" / "ab"
// <B> := "b" <B> "c" / "bc"

const grammar = p.grammar({
  Base: p.choice([
      p.negLookahead(p.any()),
      p.sequence([
        p.posLookahead(p.sequence([p.alias('A'), p.negLookahead(p.string('b'))])),
        p.zeroOrMore(p.string('a')),
        p.alias('B'),
        p.negLookahead(p.any())
      ])
    ]),
  A: p.choice([
    p.sequence([p.string('a'), p.alias('A'), p.string('b')]),
    p.string('ab')
  ]),
  B: p.choice([
    p.sequence([p.string('b'), p.alias('B'), p.string('c')]),
    p.string('bc')
  ])
})

test("non-context-free", (t) => {
  t.equal(grammar.match(''), true);
  t.equal(grammar.match('abc'), true);
  t.equal(grammar.match('aaaabbbbcccc'), true);

  t.equal(grammar.match('ab'), false);
  t.equal(grammar.match('abab'), false);
  t.equal(grammar.match('abcd'), false);
  t.equal(grammar.match('aabbc'), false);
  t.equal(grammar.match('aabbccc'), false);

  t.end();
});
