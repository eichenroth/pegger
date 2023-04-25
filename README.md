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
| Character class | `p.char('a', 'z')`, `p.char('0', '9')` | `[a-z]`, `[0-9]` |
| Any | `p.any()` | `.` |
| Optional | `p.opt(rule)` | `<rule>?` |
| Zero-or-more | `p.zeroPlus(rule)` | `<rule>*` |
| One-or-more | `p.onePlus(rule)` | `<rule>+` |
| Pos. Lookahead | `p.and(rule)` | `&<rule>` |
| Neg. Lookahead | `p.not(rule)` | `!<rule>` |
| Sequence | `p.seq([first, second])` | `<first> <second>` |
| Choice | `p.choice([first, second])` | `<first> \| <second>` |

## The Grammar
