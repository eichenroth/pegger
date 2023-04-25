import test from "tape";
import * as p from "../src";

test("one rule grammar", (t) => {
  const grammar = p.grammar({
    Rule: p.string("match_me"),
  });

  t.equal(grammar.Rule.match("match_me"), true);
  t.equal(grammar.Rule.match("match_me_please"), true);
  t.equal(grammar.Rule.match("dont_match_me"), false);

  t.end();
});

test("one alias grammar", (t) => {
  const grammar = p.grammar({
    Rule: p.string("match_me"),
    AliasRule: p.alias("Rule"),
  });

  t.equal(grammar.Rule.match("match_me"), true);
  t.equal(grammar.Rule.match("match_me_please"), true);
  t.equal(grammar.Rule.match("dont_match_me"), false);

  t.end();
});
