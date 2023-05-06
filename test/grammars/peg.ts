import test from 'tape';
import * as p from '../../src/index.ts';

// https://bford.info/pub/lang/peg.pdf used as a reference
// (creator of PEG)

// # Hierarchical syntax
// Grammar    := Spacing Definition+ EndOfFile
// Definition := Identifier LEFTARROW Expression
// Expression := Sequence (SLASH Sequence)*
// Sequence   := Prefix*
// Prefix     := (AND / NOT)? Suffix
// Suffix     := Primary (QUESTION / STAR / PLUS)?
// Primary    := Identifier !LEFTARROW
//             / OPEN Expression CLOSE
//             / Literal
//             / Class
//             / DOT

// # Lexical syntax
// Identifier := IdentStart IdentCont* Spacing
// IdentStart := [a-zA-Z_]
// IdentCont  := IdentStart / [0-9]
// Literal    := ["] (!["] Char)* ["] Spacing
//             / ['] (!['] Char)* ['] Spacing
// Class      := "[" (!"]" Range)* "]" Spacing
// Range      := Char "-" Char / Char
// Char       := "\\" [nrt""\[\]\\]
//             / "\\" [0-2][0-7][0-7]
//             / "\\" [0-7][0-7]?
//             / !"\\" .

// LEFTARROW  := ":=" Spacing
// SLASH      := "/" Spacing
// AND        := "&" Spacing
// NOT        := "!" Spacing
// QUESTION   := "?" Spacing
// STAR       := "*" Spacing
// PLUS       := "+" Spacing
// OPEN       := "(" Spacing
// CLOSE      := ")" Spacing
// DOT        := "." Spacing
// Spacing    := (Space / Comment)*
// Comment    := "#" (!EndOfLine .)* EndOfLine
// Space      := " " / "\t" / EndOfLine
// EndOfLine  := "\r\n" / "\n" / "\r"
// EndOfFile  := !.

const PEGGrammar = p.grammar({
  Grammar: p.seq([p.alias('Spacing'), p.onePlus(p.alias('Definition')), p.alias('EndOfFile')]),
  Definition: p.seq([p.alias('Identifier'), p.alias('LEFTARROW'), p.alias('Expression')]),
  Expression: p.seq([p.alias('Sequence'), p.zeroPlus(p.seq([p.alias('SLASH'), p.alias('Sequence')]))]),
  Sequence: p.zeroPlus(p.alias('Prefix')),
  Prefix: p.seq([p.opt(p.choice([p.alias('AND'), p.alias('NOT')])), p.alias('Suffix')]),
  Suffix: p.seq([p.alias('Primary'), p.opt(p.choice([p.alias('QUESTION'), p.alias('STAR'), p.alias('PLUS')]))]),
  Primary: p.choice([
    p.seq([p.alias('Identifier'), p.not(p.alias('LEFTARROW'))]),
    p.seq([p.alias('OPEN'), p.alias('Expression'), p.alias('CLOSE')]),
    p.alias('Literal'),
    p.alias('Class'),
    p.alias('DOT'),
  ]),

  Identifier: p.seq([p.alias('IdentStart'), p.zeroPlus(p.alias('IdentCont')), p.alias('Spacing')]),
  IdentStart: p.char(['a', 'z'], ['A', 'Z'], '_'),
  IdentCont: p.choice([p.alias('IdentStart'), p.char(['0', '9'])]),
  Literal: p.choice([
    p.seq([p.char('"'), p.zeroPlus(p.seq([p.not(p.char('"')), p.alias('Char')])), p.char('"'), p.alias('Spacing')]),
    p.seq([p.char("'"), p.zeroPlus(p.seq([p.not(p.char("'")), p.alias('Char')])), p.char("'"), p.alias('Spacing')]),
  ]),
  Class: p.seq([p.char('['), p.zeroPlus(p.seq([p.not(p.char(']')), p.alias('Range')])), p.char(']'), p.alias('Spacing')]),
  Range: p.choice([p.seq([p.alias('Char'), p.char('-'), p.alias('Char')]), p.alias('Char')]),
  Char: p.choice([
    p.seq([p.char('\\'), p.choice([p.char('n', 'r', 't', '"', '[', ']', '\\')])]),
    p.seq([p.char('\\'), p.char(['0', '2']), p.char(['0', '7']), p.char(['0', '7'])]),
    p.seq([p.char('\\'), p.char(['0', '7']), p.opt(p.char(['0', '7']))]),
    p.seq([p.not(p.char('\\')), p.any()]),
  ]),

  LEFTARROW: p.seq([p.string(':='), p.alias('Spacing')]),
  SLASH: p.seq([p.char('/'), p.alias('Spacing')]),
  AND: p.seq([p.char('&'), p.alias('Spacing')]),
  NOT: p.seq([p.char('!'), p.alias('Spacing')]),
  QUESTION: p.seq([p.char('?'), p.alias('Spacing')]),
  STAR: p.seq([p.char('*'), p.alias('Spacing')]),
  PLUS: p.seq([p.char('+'), p.alias('Spacing')]),
  OPEN: p.seq([p.char('('), p.alias('Spacing')]),
  CLOSE: p.seq([p.char(')'), p.alias('Spacing')]),
  DOT: p.seq([p.char('.'), p.alias('Spacing')]),
  Spacing: p.zeroPlus(p.choice([p.alias('Space'), p.alias('Comment')])),
  Comment: p.seq([p.char('#'), p.zeroPlus(p.seq([p.not(p.alias('EndOfLine')), p.any()])), p.alias('EndOfLine')]),
  Space: p.choice([p.char(' '), p.char('\t'), p.alias('EndOfLine')]),
  EndOfLine: p.choice([p.string('\r\n'), p.char('\n'), p.char('\r')]),
  EndOfFile: p.not(p.any()),
});

test('Simple PEG grammar', (t) => {
  const simpleArithmetic = `
    Value   := [0-9.]+ / '(' Expr ')'
    Product := Expr (('*' / '/') Expr)*
    Sum     := Expr (('+' / '-') Expr)*
    Expr    := Product / Sum / Value
  `;

  t.equal(PEGGrammar.rules.Grammar.matchAll(simpleArithmetic), true);

  t.end();
});
