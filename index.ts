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

export const string = (str: string): Grammar => {
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

export const character = (start: string, end: string): Grammar => {
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

export const any = (): Grammar => {
  const _parse = (input: string, startPos: number): ParseResult => {
    if (input.length > startPos)
      return { success: true, ast: input.charAt(startPos) };
    return { success: false };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
};

// optional(rule)

export const optional = (rule: Grammar): Grammar => {
  const _parse = (input: string, startPos: number): ParseResult => {
    const result = rule.parse(input.substring(startPos));
    if (result.success) return result;
    return { success: true, ast: '' };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
};

// zeroOrMore(rule)

export const zeroOrMore = (rule: Grammar): Grammar => {
  const _parse = (input: string, startPos: number): ParseResult => {
    let ast = '';
    let pos = startPos;
    while (true) {
      const result = rule.parse(input.substring(pos));
      if (!result.success) break;
      ast += result.ast;
      pos += result.ast.length;
    }
    return { success: true, ast };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
}

// oneOrMore(rule)

export const oneOrMore = (rule: Grammar): Grammar => {
  const _parse = (input: string, startPos: number): ParseResult => {
    const result = zeroOrMore(rule).parse(input.substring(startPos));
    if (result.success === false) return { success: false };
    if (result.ast.length === 0) return { success: false };
    return { success: true, ast: result.ast };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
}

// sequence([rule1, rule2, ...])

export const sequence = (rules: Grammar[]): Grammar => {
  const _parse = (input: string, startPos: number): ParseResult => {
    let ast = '';
    let pos = startPos;
    for (const rule of rules) {
      const result = rule.parse(input.substring(pos));
      if (result.success === false) return { success: false };
      ast += result.ast;
      pos += result.ast.length;
    }
    return { success: true, ast };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
};

// choice([rule1, rule2, ...])

export const choice = (rules: Grammar[]): Grammar => {
  const _parse = (input: string, startPos: number): ParseResult => {
    for (const rule of rules) {
      const result = rule.parse(input.substring(startPos));
      if (result.success) return { success: true, ast: result.ast };
    }
    return { success: false };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
}
