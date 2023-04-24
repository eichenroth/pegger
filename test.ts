import test from "tape";

type SuccessfulParseResult = {
  success: true;
  ast: string;
};

type FailedParseResult = {
  success: false;
};

type ParseResult = SuccessfulParseResult | FailedParseResult;

// planned methods:
// - parse: parses as much of the input as possible and returns a ParseResult
// - match: returns true if the input matches the grammar, false otherwise
// - parseAll: parses the entire input and returns a ParseResult
// - matchAll: returns true if the entire input matches the grammar, false otherwise

type Grammar = {
  parse: (input: string) => ParseResult;
  match: (input: string) => boolean;
};

// string("match_me")

const string = (str: string): Grammar => {
  const _parse = (input: string, startPos: number): ParseResult => {
    if (input.substring(startPos).startsWith(str))
      return { success: true, ast: str };
    return { success: false };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };  
};

// character('a', 'z')

const character = (start: string, end: string): Grammar => {
  if (start.length !== 1) throw new Error('start must be a single character');
  if (end.length !== 1) throw new Error('end must be a single character');

  const _parse = (input: string, startPos: number): ParseResult => {
    const char = input.charAt(startPos);
    if (char >= start && char <= end)
      return { success: true, ast: char };
    return { success: false };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
};

// any()

const any = (): Grammar => {
  const _parse = (input: string, startPos: number): ParseResult => {
    if (input.length > startPos)
      return { success: true, ast: input.charAt(startPos) };
    return { success: false };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
};

test("string match test", (t) => {
  const grammar = string('match_me');

  t.equal(grammar.match('match_me'), true);
  t.equal(grammar.match('match_me_please'), true);

  t.equal(grammar.match('dont_match_me'), false);

  t.end();
});

test("string parse test", (t) => {
  const grammar = string('match_me');

  t.equal(grammar.parse('match_me').success, true);
  t.equal(grammar.parse('match_me_please').success, true);
  
  t.equal(grammar.parse('dont_match_me').success, false);

  t.end();
});

test("character match test", (t) => {
  const grammar = character('a', 'z');

  t.equal(grammar.match('a'), true);
  t.equal(grammar.match('z'), true);
  t.equal(grammar.match('A'), false);
  t.equal(grammar.match('Z'), false);

  t.end();
});

test("character parse test", (t) => {
  const grammar = character('a', 'z');

  t.equal(grammar.parse('a').success, true);
  t.equal(grammar.parse('z').success, true);
  t.equal(grammar.parse('A').success, false);
  t.equal(grammar.parse('Z').success, false);

  t.end();
});

test("any match test", (t) => {
  const grammar = any();

  t.equal(grammar.match('a'), true);
  t.equal(grammar.match('0'), true);
  t.equal(grammar.match(''), false);

  t.end();
});

test("any parse test", (t) => {
  const grammar = any();

  t.equal(grammar.parse('a').success, true);
  t.equal(grammar.parse('0').success, true);
  t.equal(grammar.parse('').success, false);

  t.end();
});
