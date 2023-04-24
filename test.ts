import test from "tape";
import * as p from ".";

test("string match test", (t) => {
  const grammar = p.string('match_me');

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('match_me_please'), true);

  t.equal(grammar.match('dont_match_me'), false);

  t.end();
});

test("character match test", (t) => {
  const grammar = p.character('a', 'z');

  t.equal(grammar.match('a'), true);
  t.equal(grammar.match('z'), true);
  t.equal(grammar.match('A'), false);
  t.equal(grammar.match('Z'), false);

  t.end();
});

test("any match test", (t) => {
  const grammar = p.any();

  t.equal(grammar.match('a'), true);
  t.equal(grammar.match('0'), true);
  t.equal(grammar.match(''), false);

  t.end();
});

test("optional match test", (t) => {
  const grammar = p.optional(p.string('match_me'));

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('match_me_please'), true);
  t.equal(grammar.match('dont_match_me'), true);

  t.end();
});

test("zeroOrMore match test", (t) => {
  const grammar = p.zeroOrMore(p.string('match_me'));

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('match_me_please'), true);
  t.equal(grammar.match('match_mematch_me'), true);
  t.equal(grammar.match('dont_match_me'), true);

  t.end();
});

test("oneOrMore match test", (t) => {
  const grammar = p.oneOrMore(p.string('match_me'));

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('match_me_please'), true);
  t.equal(grammar.match('match_mematch_me'), true);
  t.equal(grammar.match('dont_match_me'), false);

  t.end();
});

test("sequence match test", (t) => {
  const grammar = p.sequence([p.string('match_me'), p.string('_please')]);

  t.equal(grammar.match('match_me_please'), true);
  t.equal(grammar.match('match_me'), false);

  t.end();
});

test("choice match test", (t) => {
  const grammar = p.choice([p.string('match_me'), p.string('please_match_me')]);

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('please_match_me'), true);
  t.equal(grammar.match('dont_match_me'), false);

  t.end();
});
