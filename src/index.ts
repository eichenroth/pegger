import { AsyncLocalStorage } from 'async_hooks';

// INTERNAL TYPES //

type ST = {
  startPos: number;
  endPos: number;
  children: ST[];
};

type InternalSuccessfulParseResult = {
  success: true;
  st: ST
};

type InternalFailedParseResult = {
  success: false;
};

type InternalParseResult = InternalSuccessfulParseResult | InternalFailedParseResult;
type InternalParseFunc = (input: string, startPos: number) => InternalParseResult;

// EXTERNAL TYPES //

type AST = {
  startPos: number;
  endPos: number;
  value: string;
}

type SuccessfulParseResult = {
  success: true;
  ast: AST;
};

type FailedParseResult = {
  success: false;
};

type ParseResult = SuccessfulParseResult | FailedParseResult;
type ParseFunc = (input: string) => ParseResult;
type MatchFunc = (input: string) => boolean;

// WRAPPERS //

const toParse = (_parse: InternalParseFunc): ParseFunc => (input) => {
  const result = _parse(input, 0);
  if (result.success) {
    return {
      success: true,
      ast: {
        startPos: result.st.startPos,
        endPos: result.st.endPos,
        value: input.substring(result.st.startPos, result.st.endPos),
      },
    };
  }
  return { success: false };
};

const toParseAll = (_parse: InternalParseFunc): ParseFunc => {
  const parse = toParse(_parse);

  return (input) => {
    const result = parse(input);
    if (result.success && result.ast.endPos === input.length) return result;
    return { success: false };
  };
};

const toMatch = (_parse: InternalParseFunc): MatchFunc => {
  const parse = toParse(_parse);

  return (input) => parse(input).success;
};

const toMatchAll = (_parse: InternalParseFunc): MatchFunc => {
  const parse = toParse(_parse);

  return (input) => {
    const result = parse(input);
    return result.success && result.ast.endPos === input.length;
  };
};

// RULES //

type Rule = {
  _parse: InternalParseFunc;
  parse: ParseFunc;
  parseAll: ParseFunc;
  match: MatchFunc;
  matchAll: MatchFunc;
};

// RULE: STRING //

export const string = (str: string): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    if (input.substring(startPos, startPos + str.length) === str) {
      return { success: true, st: { startPos, endPos: startPos + str.length, children: [] } };
    }
    return { success: false };
  };

  return {
    _parse,
    parse: toParse(_parse),
    parseAll: toParseAll(_parse),
    match: toMatch(_parse),
    matchAll: toMatchAll(_parse),
  };
};

// RULE: CHARACTER CLASS //

export const char = (start: string, end: string): Rule => {
  if (start.length !== 1) throw new Error('start must be a single character');
  if (end.length !== 1) throw new Error('end must be a single character');

  const _parse: InternalParseFunc = (input, startPos) => {
    const character = input.charAt(startPos);
    if (character >= start && character <= end) {
      return { success: true, st: { startPos, endPos: startPos + 1, children: [] } };
    }
    return { success: false };
  };

  return {
    _parse,
    parse: toParse(_parse),
    parseAll: toParseAll(_parse),
    match: toMatch(_parse),
    matchAll: toMatchAll(_parse),
  };
};

// RULE: ANY //

export const any = (): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    if (input.length > startPos) {
      return { success: true, st: { startPos, endPos: startPos + 1, children: [] } };
    }
    return { success: false };
  };

  return {
    _parse,
    parse: toParse(_parse),
    parseAll: toParseAll(_parse),
    match: toMatch(_parse),
    matchAll: toMatchAll(_parse),
  };
};

// RULE: OPTIONAL //

export const opt = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const result = rule._parse(input, startPos);
    if (result.success) {
      return { success: true, st: { startPos, endPos: result.st.endPos, children: [result.st] } };
    }
    return { success: true, st: { startPos, endPos: startPos, children: [] } };
  };

  return {
    _parse,
    parse: toParse(_parse),
    parseAll: toParseAll(_parse),
    match: toMatch(_parse),
    matchAll: toMatchAll(_parse),
  };
};

// RULE: ZERO-OR-MORE //

export const zeroPlus = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const results: InternalSuccessfulParseResult[] = [];
    let pos = startPos;

    while (true) {
      const result = rule._parse(input, pos);
      if (!result.success || startPos === result.st.endPos) break;

      pos = result.st.endPos;
      results.push(result);
    }
    return {
      success: true,
      st: { startPos, endPos: pos, children: results.map((result) => result.st) },
    };
  };

  return {
    _parse,
    parse: toParse(_parse),
    parseAll: toParseAll(_parse),
    match: toMatch(_parse),
    matchAll: toMatchAll(_parse),
  };
};

// RULE: ONE-OR-MORE //

export const onePlus = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const zeroPlusResult = zeroPlus(rule)._parse(input, startPos);

    if (zeroPlusResult.success && zeroPlusResult.st.children.length > 0) {
      return { success: true, st: zeroPlusResult.st };
    }
    return { success: false };
  };

  return {
    _parse,
    parse: toParse(_parse),
    parseAll: toParseAll(_parse),
    match: toMatch(_parse),
    matchAll: toMatchAll(_parse),
  };
};

// RULE: AND / POSITIVE LOOKAHEAD //

export const and = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const result = rule._parse(input, startPos);
    if (result.success) {
      return { success: true, st: { startPos, endPos: startPos, children: [result.st] } };
    }
    return { success: false };
  };

  return {
    _parse,
    parse: toParse(_parse),
    parseAll: toParseAll(_parse),
    match: toMatch(_parse),
    matchAll: toMatchAll(_parse),
  };
};

// RULE: NOT / NEGATIVE LOOKAHEAD //

export const not = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const result = rule._parse(input, startPos);
    if (result.success) return { success: false };
    return { success: true, st: { startPos, endPos: startPos, children: [] } };
  };

  return {
    _parse,
    parse: toParse(_parse),
    parseAll: toParseAll(_parse),
    match: toMatch(_parse),
    matchAll: toMatchAll(_parse),
  };
};

// RULE: SEQUENCE //

export const seq = (rules: Rule[]): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const results: InternalSuccessfulParseResult[] = [];
    let pos = startPos;

    const success = rules.every((rule) => {
      const result = rule._parse(input, pos);
      if (!result.success) return false;

      pos = result.st.endPos;
      results.push(result);
      return true;
    });

    if (success) {
      return {
        success: true,
        st: { startPos, endPos: pos, children: results.map((result) => result.st) },
      };
    }
    return { success: false };
  };

  return {
    _parse,
    parse: toParse(_parse),
    parseAll: toParseAll(_parse),
    match: toMatch(_parse),
    matchAll: toMatchAll(_parse),
  };
};

// RULE: CHOICE //

export const choice = (rules: Rule[]): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const rule of rules) {
      const result = rule._parse(input, startPos);
      if (result.success) {
        return {
          success: true,
          st: { startPos, endPos: result.st.endPos, children: [result.st] },
        };
      }
    }
    return { success: false };
  };

  return {
    _parse,
    parse: toParse(_parse),
    parseAll: toParseAll(_parse),
    match: toMatch(_parse),
    matchAll: toMatchAll(_parse),
  };
};

// GRAMMAR //

type Grammar<T extends string> = {
  rules: Record<T, Rule>;
}

type GrammarContext<T extends string> = {
  grammar: Grammar<T>;
};

const GrammarStorage = new AsyncLocalStorage<GrammarContext<string> | undefined>();

export const alias = (name: string): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const rule = GrammarStorage.getStore()?.grammar.rules[name];
    const result = rule?._parse(input, startPos);

    if (result?.success) {
      return { success: true, st: { startPos, endPos: result.st.endPos, children: [result.st] } };
    }
    return { success: false };
  };

  // TODO: this is not too clean, since aliases only make sense inside grammars
  return {
    _parse,
    parse: toParse(_parse),
    parseAll: toParseAll(_parse),
    match: toMatch(_parse),
    matchAll: toMatchAll(_parse),
  };
};

export const grammar = <T extends string>(ruleDict: Record<T, Rule>): Grammar<T> => {
  const rules: Record<T, Rule> = {} as Record<T, Rule>;
  const newGrammar = { rules };

  Object.entries<Rule>(ruleDict).forEach(([name, rule]) => {
    const typedName = name as T;

    const _parse: InternalParseFunc = (input, startPos) => GrammarStorage.run(
      { grammar: newGrammar },
      rule._parse,
      input,
      startPos,
    );

    rules[typedName] = {
      _parse,
      parse: toParse(_parse),
      parseAll: toParseAll(_parse),
      match: toMatch(_parse),
      matchAll: toMatchAll(_parse),
    };
  });

  return newGrammar;
};
