import test from 'tape';
import * as p from '../src/index.ts';

test('string match test', (t) => {
  const grammar = p.string('match_me');

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('match_me_please'), true);

  t.equal(grammar.match('dont_match_me'), false);

  t.end();
});

test('char match test', (t) => {
  const grammar = p.char('a', 'z');

  t.equal(grammar.match('a'), true);
  t.equal(grammar.match('z'), true);
  t.equal(grammar.match('A'), false);
  t.equal(grammar.match('Z'), false);

  t.end();
});

test('any match test', (t) => {
  const grammar = p.any();

  t.equal(grammar.match('a'), true);
  t.equal(grammar.match('0'), true);
  t.equal(grammar.match(''), false);

  t.end();
});

test('opt match test', (t) => {
  const grammar = p.opt(p.string('match_me'));

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('match_me_please'), true);
  t.equal(grammar.match('dont_match_me'), true);

  t.end();
});

test('zeroPlus match test', (t) => {
  const grammar = p.zeroPlus(p.string('match_me'));

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('match_me_please'), true);
  t.equal(grammar.match('match_mematch_me'), true);
  t.equal(grammar.match('dont_match_me'), true);

  t.end();
});

test('onePlus match test', (t) => {
  const grammar = p.onePlus(p.string('match_me'));

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('match_me_please'), true);
  t.equal(grammar.match('match_mematch_me'), true);
  t.equal(grammar.match('dont_match_me'), false);

  t.end();
});

test('and match test', (t) => {
  const grammar = p.and(p.string('match_me'));

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('match_me_please'), true);
  t.equal(grammar.match('dont_match_me'), false);

  t.end();
});

test('not match test', (t) => {
  const grammar = p.not(p.string('match_me'));

  t.equal(grammar.match('match_me'), false);
  t.equal(grammar.match('match_me_please'), false);
  t.equal(grammar.match('dont_match_me'), true);

  t.end();
});

test('seq match test', (t) => {
  const grammar = p.seq([p.string('match_me'), p.string('_please')]);

  t.equal(grammar.match('match_me_please'), true);
  t.equal(grammar.match('match_me'), false);

  t.end();
});

test('choice match test', (t) => {
  const grammar = p.choice([p.string('match_me'), p.string('please_match_me')]);

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('please_match_me'), true);
  t.equal(grammar.match('dont_match_me'), false);

  t.end();
});
