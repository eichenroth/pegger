# pegger

## Introduction

## Base Usage



## Rules

| Rule | Definition | PEG | EBNF |
| --- | --- | --- | --- |
| String | `p.string('match_me')` | `"match_me"` <br /> `'match_me'` | `"match_me"` |
| Character class | `p.char('a', 'z')` <br /> `p.char('0', '9')` | `[a-z]` <br /> `[0-9]` | `"a" \| "b" \| ... \| "z"` <br /> `"0" \| "1" \| ... \| "9"` |
| Any | `p.any()` | `.` | |
| Optional | `p.opt(rule)` | `rule?` | `[rule]` |
| Zero-or-more | `p.zeroPlus(rule)` | `rule*` | `{rule}` |
| One-or-more | `p.onePlus(rule)` | `rule+` | `rule, {rule}` |
| Pos. Lookahead | `p.and(rule)` | `&rule` | |
| Neg. Lookahead | `p.not(rule)` | `!rule` | |
| Sequence | `p.seq([first, second])` | `first second` | `first, second` |
| Choice | `p.choice([first, second])` | `first \| second` | `first \| second` |

## The Grammar

## Goals

- Implement original PEG Form
- Implement EBNF Form
- Implement McKeeman Form

## Non-Context-Free Languages

Some non-context-sensitive languages can be parsed by PEG.
Take the language

$$
\{a^n b^n c^n | n \in \mathbb{N}_1 \}
$$

All strings of this language can be matched by a grammar with the following definition:

```
S := &(A 'c') 'a'+ B !.
A := 'a' A? 'b'
B := 'b' B? 'c'
```