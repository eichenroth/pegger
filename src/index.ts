type AST = string

type SuccessfulParseResult = {
  success: true;
  // having substrings here is not ideal,
  // because it means that the parse would probably run in O(n^2) time
  // to prevent that we should only create an AST / tree with strings after a successful parse
  ast: AST;
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

type InternalSuccessfulParseResult = {
  success: true;
  startPos: number;
  endPos: number;
};

type InternalFailedParseResult = {
  success: false;
};

type InternalParseResult = InternalSuccessfulParseResult | InternalFailedParseResult;

type InternalParseFunc = (input: string, startPos: number) => InternalParseResult;

type ParseFunc = (input: string) => ParseResult;
type MatchFunc = (input: string) => boolean;

const toParse = (parse: InternalParseFunc): ParseFunc => (input) => {
  const result = parse(input, 0);
  if (!result.success) {
    return { success: false };
  }
  return { success: true, ast: input.substring(result.startPos, result.endPos) };
};

const toMatch = (parse: InternalParseFunc): MatchFunc => (input) => {
  const result = parse(input, 0);
  return result.success;
};

type Rule = {
  _parse: InternalParseFunc;
  parse: ParseFunc;
  match: MatchFunc;
};

// type GrammarRule = {
//   parse: (input: string, grammar?: Grammar<string>) => ParseResult;
//   match: (input: string, grammar?: Grammar<string>) => boolean;
// };

type GrammarAlias = GrammarRule;

type Grammar<T extends string> = { [key in T]: GrammarRule | GrammarAlias }

// STRING //

export const string = (str: string): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    if (input.substring(startPos, startPos + str.length) === str) {
      return { success: true, startPos, endPos: startPos + str.length };
    }
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// CHARACTER CLASS //

export const char = (start: string, end: string): Rule => {
  if (start.length !== 1) throw new Error('start must be a single character');
  if (end.length !== 1) throw new Error('end must be a single character');

  const _parse: InternalParseFunc = (input, startPos) => {
    const character = input.charAt(startPos);
    if (character >= start && character <= end) {
      return { success: true, startPos, endPos: startPos + 1 };
    }
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// ANY //

export const any = (): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    if (input.length > startPos) {
      return { success: true, startPos, endPos: startPos + 1 };
    }
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// OPTIONAL //

export const opt = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const result = rule.parse(input.substring(startPos));
    if (result.success) {
      return { success: true, startPos, endPos: startPos + result.ast.length };
    }
    return { success: true, startPos, endPos: startPos };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// ZERO-OR-MORE //

export const zeroPlus = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    let pos = startPos;
    while (true) {
      const result = rule.parse(input.substring(pos));
      if (!result.success || result.ast.length === 0) break;
      pos += result.ast.length;
    }
    return { success: true, startPos, endPos: pos };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// ONE-OR-MORE //

export const onePlus = (rule: Rule): Rule => {
  // TODO: make this cleaner
  const _parse: InternalParseFunc = (input, startPos) => {
    let pos = startPos;
    let success = false;
    while (true) {
      const result = rule.parse(input.substring(pos));
      if (!result.success || result.ast.length === 0) break;
      pos += result.ast.length;
      success = true;
    }
    if (success) return { success: true, startPos, endPos: pos };
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// AND / POSITIVE LOOKAHEAD //

export const and = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const result = rule.parse(input.substring(startPos));
    if (result.success) return { success: true, startPos, endPos: startPos };
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// NOT / NEGATIVE LOOKAHEAD //

export const not = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const result = rule.parse(input.substring(startPos));
    if (result.success) return { success: false };
    return { success: true, startPos, endPos: startPos };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// SEQUENCE //

export const seq = (rules: Rule[]): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    let pos = startPos;

    const success = rules.every((rule) => {
      const result = rule.parse(input.substring(pos));
      if (result.success === false) return false;
      pos += result.ast.length;
      return true;
    });

    if (success) return { success: true, startPos, endPos: pos };
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// CHOICE //

export const choice = (rules: Rule[]): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    let pos = startPos;

    const success = rules.some((rule) => {
      const result = rule.parse(input.substring(pos));
      if (result.success === false) return false;
      pos += result.ast.length;
      return true;
    });

    if (success) {
      return {
        success: true, startPos, endPos: pos,
      };
    }
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// alias('AliasName')

export const alias = (name: string): GrammarAlias => {
  const _parse = (input: string, startPos: number, grammar?: Grammar<string>): ParseResult => {
    if (!grammar) return { success: false };
    const rule = grammar[name];
    if (!rule) return { success: false };

    const result = rule.parse(input.substring(startPos));
    if (result.success) return { success: true, ast: result.ast };

    return { success: false };
  };

  const parse = (input: string, grammar?: Grammar<string>) => _parse(input, 0, grammar);
  const match = (input: string, grammar?: Grammar<string>) => _parse(input, 0, grammar).success;

  return { parse, match };
};

export const grammar = <T extends string>(ruleDict: Grammar<T>): Grammar<T> => {
  const g: Record<string, GrammarRule | GrammarAlias> = {};

  Object.entries<GrammarRule | GrammarAlias>(ruleDict).forEach(([name, rule]) => {
    g[name] = {
      parse: (input: string) => rule.parse(input, g),
      match: (input: string) => rule.match(input, g),
    };
  });

  // TODO: fix this unchristian type casting
  return g as Grammar<T>;
};
