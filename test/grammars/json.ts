import test from 'tape';
import * as p from '../../src/index.ts';

// https://www.crockford.com/mckeeman.html used as a reference (creator of JSON)

// json := element
// value := object / array / string / number / true / false / null
// object := "{" ws "}" / "{" members "}"
// members := member ("," member)*
// member := ws string ws ":" element
// array := "[" ws "]" / "[" elements "]"
// elements := element ("," element)*
// element := ws value ws
// string := "\"" char* "\""
// char := !"\"" !"\\" . / escape
// escape := "\\" ( "\"" / "\\" / "/" / "b" / "f" / "n" / "r" / "t" / "u" hex hex hex hex )
// hex := [0-9] / [a-f] / [A-F]
// number := int frac exp
// int := "-"? ("0" / [1-9] [0-9]*)
// frac := "." [0-9]+ / ""
// exp := ("e" / "E") ("-" / "+")? [0-9]+ / ""
// ws := (" " / "\n" / "\r" / "\t")*
// true := "true"
// false := "false"
// null := "null"

const JsonGrammar = p.grammar({
  json: p.alias('element'),
  value: p.choice([
    p.alias('object'),
    p.alias('array'),
    p.alias('string'),
    p.alias('number'),
    p.alias('true'),
    p.alias('false'),
    p.alias('null'),
  ]),
  object: p.choice([
    p.seq([p.string('{'), p.alias('ws'), p.string('}')]),
    p.seq([p.string('{'), p.alias('members'), p.string('}')]),
  ]),
  members: p.seq([
    p.alias('member'),
    p.zeroPlus(p.seq([p.string(','), p.alias('member')])),
  ]),
  member: p.seq([
    p.alias('ws'),
    p.alias('string'),
    p.alias('ws'),
    p.string(':'),
    p.alias('element'),
  ]),
  array: p.choice([
    p.seq([p.string('['), p.alias('ws'), p.string(']')]),
    p.seq([p.string('['), p.alias('elements'), p.string(']')]),
  ]),
  elements: p.seq([
    p.alias('element'),
    p.zeroPlus(p.seq([p.string(','), p.alias('element')])),
  ]),
  element: p.seq([p.alias('ws'), p.alias('value'), p.alias('ws')]),
  string: p.seq([
    p.string('"'),
    p.zeroPlus(p.alias('char')),
    p.string('"'),
  ]),
  char: p.choice([
    p.seq([p.not(p.string('"')), p.not(p.string('\\')), p.any()]),
    p.alias('escape'),
  ]),
  escape: p.seq([
    p.string('\\'),
    p.choice([
      p.string('"'),
      p.string('\\'),
      p.string('/'),
      p.string('b'),
      p.string('f'),
      p.string('n'),
      p.string('r'),
      p.string('t'),
      p.seq([p.string('u'), p.alias('hex'), p.alias('hex'), p.alias('hex'), p.alias('hex')]),
    ]),
  ]),
  hex: p.choice([p.char('0', '9'), p.char('a', 'f'), p.char('A', 'F')]),
  number: p.seq([p.alias('int'), p.alias('frac'), p.alias('exp')]),
  int: p.seq([
    p.opt(p.string('-')),
    p.choice([
      p.string('0'),
      p.seq([p.char('1', '9'), p.zeroPlus(p.char('0', '9'))]),
    ]),
  ]),
  frac: p.choice([
    p.seq([p.string('.'), p.onePlus(p.char('0', '9'))]),
    p.string(''),
  ]),
  exp: p.choice([
    p.seq([
      p.choice([p.string('e'), p.string('E')]),
      p.opt(p.choice([p.string('-'), p.string('+')])),
      p.onePlus(p.char('0', '9')),
    ]),
    p.string(''),
  ]),
  ws: p.zeroPlus(p.choice([
    p.string(' '),
    p.string('\n'),
    p.string('\r'),
    p.string('\t'),
  ])),
  true: p.string('true'),
  false: p.string('false'),
  null: p.string('null'),
});

// object / array / string / number / true / false / null

test('json null', (t) => {
  t.equal(JsonGrammar.rules.null.matchAll('null'), true);
  t.equal(JsonGrammar.rules.json.matchAll(' null '), true);
  t.end();
});

test('json true', (t) => {
  t.equal(JsonGrammar.rules.true.matchAll('true'), true);
  t.equal(JsonGrammar.rules.json.matchAll(' true '), true);
  t.end();
});

test('json false', (t) => {
  t.equal(JsonGrammar.rules.false.matchAll('false'), true);
  t.equal(JsonGrammar.rules.json.matchAll(' false '), true);
  t.end();
});

test('json number', (t) => {
  t.equal(JsonGrammar.rules.number.matchAll('0'), true);
  t.equal(JsonGrammar.rules.json.matchAll(' 0 '), true);

  t.equal(JsonGrammar.rules.json.matchAll('1'), true);
  t.equal(JsonGrammar.rules.json.matchAll('1.0'), true);
  t.equal(JsonGrammar.rules.json.matchAll('1.0e1'), true);
  t.equal(JsonGrammar.rules.json.matchAll('1.0e+1'), true);
  t.equal(JsonGrammar.rules.json.matchAll('1.0e-1'), true);
  t.equal(JsonGrammar.rules.json.matchAll('-1'), true);
  t.equal(JsonGrammar.rules.json.matchAll('-1.0'), true);
  t.equal(JsonGrammar.rules.json.matchAll('-1.0e1'), true);
  t.equal(JsonGrammar.rules.json.matchAll('-1.0e+1'), true);
  t.equal(JsonGrammar.rules.json.matchAll('-1.0e-1'), true);

  t.equal(JsonGrammar.rules.json.matchAll('0.'), false);
  t.equal(JsonGrammar.rules.json.matchAll('0.0e'), false);
  t.equal(JsonGrammar.rules.json.matchAll('0.0e+'), false);
  t.equal(JsonGrammar.rules.json.matchAll('0.0e-'), false);

  t.end();
});

test('json string', (t) => {
  t.equal(JsonGrammar.rules.string.matchAll('""'), true);
  t.equal(JsonGrammar.rules.json.matchAll(' "" '), true);

  t.equal(JsonGrammar.rules.json.matchAll('"a"'), true);
  t.equal(JsonGrammar.rules.json.matchAll('"a\\"b"'), true);
  t.equal(JsonGrammar.rules.json.matchAll('"a\\nb"'), true);
  t.equal(JsonGrammar.rules.json.matchAll('"a\\rb"'), true);
  t.equal(JsonGrammar.rules.json.matchAll('"a\\tb"'), true);
  t.equal(JsonGrammar.rules.json.matchAll('"a\\fb"'), true);
  t.equal(JsonGrammar.rules.json.matchAll('"a\\ufffb"'), true);
  t.equal(JsonGrammar.rules.json.matchAll('"a\\u0000b"'), true);

  t.equal(JsonGrammar.rules.json.matchAll('"a'), false);
  t.equal(JsonGrammar.rules.json.matchAll('"a\\"'), false);

  t.end();
});

test('json array', (t) => {
  t.equal(JsonGrammar.rules.array.matchAll('[]'), true);
  t.equal(JsonGrammar.rules.json.matchAll(' [] '), true);

  t.equal(JsonGrammar.rules.json.matchAll('[1]'), true);
  t.equal(JsonGrammar.rules.json.matchAll('[1,"a"]'), true);
  t.equal(JsonGrammar.rules.json.matchAll('[1,"a",true]'), true);
  t.equal(JsonGrammar.rules.json.matchAll('[1,"a",true,null]'), true);
  t.equal(JsonGrammar.rules.json.matchAll('[1,"a",true,null,{}]'), true);

  t.equal(JsonGrammar.rules.json.matchAll('[1,"a",true,null,{}'), false);
  t.equal(JsonGrammar.rules.json.matchAll('[1,"a",true,null,{}]]'), false);

  t.end();
});

const jsonString = `
  {
    "name": "John",
    "age": 30,
    "address": {
      "street": "Main Street",
      "city": "New York"
    },
    "phoneNumbers": [
      "212 555-1234",
      "646 555-4567"
    ]
  }
`;

test('json object', (t) => {
  t.equal(JsonGrammar.rules.object.matchAll('{}'), true);
  t.equal(JsonGrammar.rules.json.matchAll(' {} '), true);

  t.equal(JsonGrammar.rules.json.matchAll('{"a":1}'), true);
  t.equal(JsonGrammar.rules.json.matchAll('{"a":1,"b":"a"}'), true);
  t.equal(JsonGrammar.rules.json.matchAll('{"a":1,"b":"a","c":true}'), true);
  t.equal(JsonGrammar.rules.json.matchAll('{"a":1,"b":"a","c":true,"d":null}'), true);
  t.equal(JsonGrammar.rules.json.matchAll('{"a":1,"b":"a","c":true,"d":null,"e":{}}'), true);

  t.equal(JsonGrammar.rules.json.matchAll(jsonString), true);

  t.end();
});
