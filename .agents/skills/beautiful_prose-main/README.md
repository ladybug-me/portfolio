# beautiful_prose

Teach your model to write clean, forceful prose with none of the usual AI tics.

## What it is
An agent skill that acts as a style contract. Once active, the model writes declarative, concrete, rhythmically varied English and treats the familiar AI habits as failures: em dashes, reversal pivots, filler transitions, therapy voice, meta commentary and decorative three-part lists.

## Who it's for
- Writers and editors who use a model for drafts and are tired of rewriting the same tells.
- Founders and operators who send memos, letters and posts under their own name.
- Agent builders who want every agent on a team to share one house style.

## Quick start
1. Copy the skill into your agent's skills folder:
   ```bash
   git clone https://github.com/SHADOWPR0/beautiful_prose.git
   cp -R beautiful_prose ~/.claude/skills/beautiful-prose
   ```
   Other agent environments: point the skill or rules loader at `SKILL.md`.
2. Start any request with:
   ```text
   Apply the Beautiful Prose skill.
   ```
3. Optionally tune it with one-line controls before the request:
   ```text
   REGISTER: founding_fathers | literary_modern | cold_steel | journalistic
   DENSITY: lean | standard | dense
   HEAT: cool | warm | hot
   LENGTH: micro | short | medium | long
   ```
   With no register set, it defaults to `literary_modern`.

## Example
Prompt:
```text
Apply the Beautiful Prose skill.
REGISTER: cold_steel
Rewrite: "At its core, this is a complex issue. That said, in today's world,
it's important to note that discipline isn't about willpower, it's about systems."
```

Typical output:
```text
Discipline is a system. Willpower runs out by noon; a system runs all day.
Build the system and stop negotiating with yourself.
```

The rewrite drops the filler opener ("At its core"), the pivot ("isn't about X, it's about Y") and the throat-clearing ("it's important to note"), and keeps the claim.

## How it works
1. **Prohibitions:** a fixed list of banned patterns (em dashes, reversal pivots, filler transitions, validation language, meta talk, symmetry padding).
2. **Positive constraints:** declarative sentences, aggressive length variation, concrete nouns, strong verbs, paragraphs that breathe, endings without summary.
3. **Registers:** four optional voices, from formal civic gravity to severe compression.
4. **Quality bar and lint checklist:** before finishing, the model removes template-sounding lines, repeated sentences and emotional steering, and fails its own output on any banned pattern. When in doubt it writes less.

## Testing
`references/test-cases.md` holds four prompts (a standards memo, a sharpening rewrite, an annual-letter closing and a technical explanation) with the checks each output must pass. Run them after any edit to `SKILL.md`.

## Files
```text
beautiful_prose/
  SKILL.md                    # the style contract
  references/test-cases.md    # prompts and pass criteria
```

## Author
Maintained by the owner of [@SHADOWPR0](https://github.com/SHADOWPR0). Issues and suggestions are welcome in this repo.
