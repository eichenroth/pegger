# pegger

## Introduction

## Base Usage

Assume you have the need to parse all strings matching {a<sup>n</sup>b<sup>n</sup>c<sup>n</sup> | n ∈ ℕ}.

These strings are matched by a grammar with the following definition.

```
<Grammar> := !. / &(<A>!"b")"a"*<B>!.
<A> := "a" <A> "b" / "ab"
<B> := "b" <B> "c" / "bc"
```


## Rules

| Rule | Definition | String Definition |
| --- | --- | --- |
| String | `p.string('match_me')` | `"match_me"`, `'match_me'` |
| Character class | `p.character('a', 'z')`, `p.character('0', '9')` | `[a-z]`, `[0-9]` |
| Any | `p.any()` | `.` |
| Optional | `p.optional(rule)` | `<rule>?` |
| Zero-or-more | `p.zeroOrMore(rule)` | `<rule>*` |
| One-or-more | `p.oneOrMore(rule)` | `<rule>+` |
| Pos. Lookahead | `p.posLookahead(rule)` | `&<rule>` |
| Neg. Lookahead | `p.negLookahead(rule)` | `!<rule>` |
| Sequence | `p.sequence([first, second])` | `<first> <second>` |
| Choice | `p.choice([first, second])` | `<first> \| <second>` |

## The Grammar
