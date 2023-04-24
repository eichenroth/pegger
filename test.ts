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
