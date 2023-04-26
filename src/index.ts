type ST = {
  startPos: number;
  endPos: number;
  children: ST[];
};

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

// planned methods:
// - parse: parses as much of the input as possible and returns a ParseResult
// - match: returns true if the input matches the grammar, false otherwise
// - parseAll: parses the entire input and returns a ParseResult
// - matchAll: returns true if the entire input matches the grammar, false otherwise

type InternalSuccessfulParseResult = {
  success: true;
  st: ST
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

// type GrammarAlias = GrammarRule;

// type Grammar<T extends string> = { [key in T]: GrammarRule | GrammarAlias }

// STRING //

export const string = (str: string): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    if (input.substring(startPos, startPos + str.length) === str) {
      return { success: true, st: { startPos, endPos: startPos + str.length, children: [] } };
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
      return { success: true, st: { startPos, endPos: startPos + 1, children: [] } };
    }
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// ANY //

export const any = (): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    if (input.length > startPos) {
      return { success: true, st: { startPos, endPos: startPos + 1, children: [] } };
    }
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// OPTIONAL //

export const opt = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const result = rule._parse(input, startPos);
    if (result.success) {
      return { success: true, st: { startPos, endPos: result.st.endPos, children: [result.st] } };
    }
    return { success: true, st: { startPos, endPos: startPos, children: [] } };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// ZERO-OR-MORE //

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

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// ONE-OR-MORE //

export const onePlus = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const zeroPlusResult = zeroPlus(rule)._parse(input, startPos);

    if (zeroPlusResult.success && zeroPlusResult.st.children.length > 0) {
      return { success: true, st: zeroPlusResult.st };
    }
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// AND / POSITIVE LOOKAHEAD //

export const and = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const result = rule._parse(input, startPos);
    if (result.success) {
      return { success: true, st: { startPos, endPos: startPos, children: [result.st] } };
    }
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// NOT / NEGATIVE LOOKAHEAD //

export const not = (rule: Rule): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    const result = rule._parse(input, startPos);
    if (result.success) return { success: false };
    return { success: true, st: { startPos, endPos: startPos, children: [] } };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// SEQUENCE //

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

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// CHOICE //

export const choice = (rules: Rule[]): Rule => {
  const _parse: InternalParseFunc = (input, startPos) => {
    for (const rule of rules) {
      const result = rule._parse(input, startPos);
      if (result.success) return result;
    }

    let successfulResult: InternalSuccessfulParseResult;
    const pos = startPos;

    const success = rules.some((rule) => {
      const result = rule._parse(input, pos);
      if (result.success === false) return false;

      successfulResult = result;
      return true;
      // return result;
      // pos = result.st.endPos;
      // return true;
    });

    if (successfulResult) {
      return { success: true, st: { startPos, endPos: pos, children: [successfulResult.st] } };
    }
    return { success: false };
  };

  return { _parse, parse: toParse(_parse), match: toMatch(_parse) };
};

// alias('AliasName')

// export const alias = (name: string): GrammarAlias => {
//   const _parse = (input: string, startPos: number, grammar?: Grammar<string>): ParseResult => {
//     if (!grammar) return { success: false };
//     const rule = grammar[name];
//     if (!rule) return { success: false };

//     const result = rule.parse(input.substring(startPos));
//     if (result.success) return { success: true, ast: result.ast };

//     return { success: false };
//   };

//   const parse = (input: string, grammar?: Grammar<string>) => _parse(input, 0, grammar);
//   const match = (input: string, grammar?: Grammar<string>) => _parse(input, 0, grammar).success;

//   return { parse, match };
// };

// export const grammar = <T extends string>(ruleDict: Grammar<T>): Grammar<T> => {
//   const g: Record<string, GrammarRule | GrammarAlias> = {};

//   Object.entries<GrammarRule | GrammarAlias>(ruleDict).forEach(([name, rule]) => {
//     g[name] = {
//       parse: (input: string) => rule.parse(input, g),
//       match: (input: string) => rule.match(input, g),
//     };
//   });

//   // TODO: fix this unchristian type casting
//   return g as Grammar<T>;
// };
