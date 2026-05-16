---
name: rule
description: Add a new rule or guideline to the project's CLAUDE.md file. Use this skill whenever the user invokes "/rule <description>", says "add a rule that...", "remember that...", "add to CLAUDE.md that...", "note the rule that...", or wants to codify any coding convention, preference, or behavioral guideline into the project instructions. Always use this skill when the user is trying to establish a new standing rule for how Claude should behave in this project.
---

# Rule — Add a Rule to CLAUDE.md

The user wants to permanently record a rule or guideline into the project's `CLAUDE.md` so it applies to all future sessions.

## Your job

1. **Read the current CLAUDE.md** to understand its existing sections and rules — you need this to avoid duplicating an existing rule and to find the right place for the new one.

2. **Distill the user's description into a concise, well-formed rule.** A good rule is:
   - Stated as an imperative or clear declarative fact
   - Scoped precisely (don't over-generalize)
   - Free of "always" / "never" preamble unless genuinely needed
   - About 1–3 sentences — enough to be unambiguous, not more

3. **Find the right section.** If an existing section covers the same domain (e.g., component structure, file organization, styling), add the rule there. If no section fits, create a new `## <Topic>` heading.

4. **Edit CLAUDE.md** with the new rule. Preserve the existing content and formatting. Don't rewrite or reorganize anything that wasn't touched.

5. **Confirm** to the user in one sentence what was added and where.

## Writing style for rules

Match the tone of the existing CLAUDE.md in this project. Look at the rules already there and write in the same register — typically plain prose, imperative voice, no filler words. The rule should read like something a senior engineer wrote on a Friday afternoon: direct, no-nonsense, and clearly motivated by a real experience.

If the user's description is vague or ambiguous, ask one clarifying question before writing anything. Don't guess at intent for something that will persist permanently.

## What NOT to do

- Don't add a rule that contradicts an existing one without flagging the conflict to the user first.
- Don't pad the rule with explanations that belong in a comment, not a standing instruction.
- Don't create a new section if an existing one is a reasonable fit.
- Don't reformat or touch any part of CLAUDE.md outside the specific insertion.
