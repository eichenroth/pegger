type AST = string

type SuccessfulParseResult = {
  success: true;
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

type GrammarRule = {
  parse: (input: string, grammar?: Grammar<string>) => ParseResult;
  match: (input: string, grammar?: Grammar<string>) => boolean;
};

type GrammarAlias = GrammarRule;

type Grammar<T extends string> = { [key in T]: GrammarRule | GrammarAlias }


// string("match_me")

export const string = (str: string): GrammarRule => {
  const _parse = (input: string, startPos: number): ParseResult => {
    if (input.substring(startPos).startsWith(str))
      return { success: true, ast: str };
    return { success: false };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };  
};

// char('a', 'z')

export const char = (start: string, end: string): GrammarRule => {
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

export const any = (): GrammarRule => {
  const _parse = (input: string, startPos: number): ParseResult => {
    if (input.length > startPos)
      return { success: true, ast: input.charAt(startPos) };
    return { success: false };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
};

// opt(rule)

export const opt = (rule: GrammarRule): GrammarRule => {
  const _parse = (input: string, startPos: number): ParseResult => {
    const result = rule.parse(input.substring(startPos));
    if (result.success) return result;
    return { success: true, ast: '' };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
};

// zeroPlus(rule)

export const zeroPlus = (rule: GrammarRule): GrammarRule => {
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

// onePlus(rule)

export const onePlus = (rule: GrammarRule): GrammarRule => {
  const _parse = (input: string, startPos: number): ParseResult => {
    const result = zeroPlus(rule).parse(input.substring(startPos));
    if (result.success === false) return { success: false };
    if (result.ast.length === 0) return { success: false };
    return { success: true, ast: result.ast };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
}

// and(rule)

export const and = (rule: GrammarRule): GrammarRule => {
  const _parse = (input: string, startPos: number): ParseResult => {
    const result = rule.parse(input.substring(startPos));
    if (result.success) return { success: true, ast: '' };
    return { success: false };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
}

// not(rule)

export const not = (rule: GrammarRule): GrammarRule => {
  const _parse = (input: string, startPos: number): ParseResult => {
    const result = rule.parse(input.substring(startPos));
    if (result.success) return { success: false };
    return { success: true, ast: '' };
  }

  const parse = (input: string) => _parse(input, 0);
  const match = (input: string) => _parse(input, 0).success;

  return { parse, match };
}

// seq([rule1, rule2, ...])

export const seq = (rules: GrammarRule[]): GrammarRule => {
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

export const choice = (rules: GrammarRule[]): GrammarRule => {
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

// alias('AliasName')

export const alias = (name: string): GrammarAlias => {
  const _parse = (input: string, startPos: number, grammar?: Grammar<string>): ParseResult => {
    if (!grammar) return { success: false };
    const rule = grammar[name];
    if (!rule) return { success: false };

    const result = rule.parse(input.substring(startPos));
    if (result.success) return { success: true, ast: result.ast };

    return { success: false };
  }

  const parse = (input: string, grammar?: Grammar<string>) => _parse(input, 0, grammar);
  const match = (input: string, grammar?: Grammar<string>) => _parse(input, 0, grammar).success;

  return { parse, match };  

};

export const grammar = <T extends string>(ruleDict: Grammar<T>): Grammar<T> => {
  const grammar: Record<string, GrammarRule | GrammarAlias> = {};

  Object.entries<GrammarRule | GrammarAlias>(ruleDict).map(([name, rule]) => {
    grammar[name] = {
      parse: (input: string) => rule.parse(input, grammar),
      match: (input: string) => rule.match(input, grammar)
    };
  });

  // TODO: fix this unchristian type casting
  return grammar as Grammar<T>;
};
