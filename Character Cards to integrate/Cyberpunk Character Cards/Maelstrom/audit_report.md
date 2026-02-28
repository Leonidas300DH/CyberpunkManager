# Audit Report: Maelstrom

### File: CZ_CharacterCards_Maelstrom_Berserker.pdf
**Status:** [CORRECT]

### File: CZ_CharacterCards_Maelstrom_Berserker_Vet1.pdf
**Status:** [CORRECT]

### File: CZ_CharacterCards_Maelstrom_Crusher.pdf
**Status:** [CORRECT]

### File: CZ_CharacterCards_Maelstrom_Crusher_Vet1.pdf
**Status:** [INCORRECT]
**Errors Found:**
- Action Tokens: JSON has Green 0, Yellow 2. Card shows 3 Yellow tokens.

### File: CZ_CharacterCards_Maelstrom_Flenser.pdf
**Status:** [INCORRECT]
**Errors Found:**
- Actions: "MIND LINK" is incorrectly classified as a `passiveRule` in the JSON. On the card, it is an Action requiring the Influence skill and has a Range profile (Red/Yellow/Green). It must be extracted into the `actions` array.

### File: CZ_CharacterCards_Maelstrom_Flenser_Vet1.pdf
**Status:** [INCORRECT]
**Errors Found:**
- Actions: "MIND LINK" is incorrectly classified as a `passiveRule` in the JSON. On the card, it is an Action requiring the Influence skill and has a Range profile.

### File: CZ_CharacterCards_Maelstrom_Hammerlord.pdf
**Status:** [CORRECT]

### File: CZ_CharacterCards_Maelstrom_Hammerlord_Vet1.pdf
**Status:** [INCORRECT]
**Errors Found:**
- Action Tokens: JSON has Green 2, Yellow 1 (3 tokens total). Card only shows 2 tokens (1 Green, 1 Yellow).

### File: CZ_CharacterCards_Maelstrom_MunitionsSpecialist.pdf
**Status:** [CORRECT]

### File: CZ_CharacterCards_Maelstrom_MunitionsSpecialist_Vet1.pdf
**Status:** [INCORRECT]
**Errors Found:**
- Action Tokens: JSON has Green 0, Yellow 3. Card shows 1 Green and 2 Yellow tokens.

### File: CZ_CharacterCards_Maelstrom_Pledge.pdf
**Status:** [CORRECT]

### File: CZ_CharacterCards_Maelstrom_RangedSpecialist.pdf
**Status:** [CORRECT]

### File: CZ_CharacterCards_Maelstrom_RangedSpecialist_Vet1.pdf
**Status:** [INCORRECT]
**Errors Found:**
- Action Tokens: JSON has Green 0, Yellow 3. Card shows 1 Green and 2 Yellow tokens.

### File: CZ_CharacterCards_Maelstrom_Ripper.pdf
**Status:** [CORRECT]

### File: CZ_CharacterCards_Maelstrom_Ripper_Vet1.pdf
**Status:** [INCORRECT]
**Errors Found:**
- Action Tokens: JSON has Green 0, Yellow 2. Card shows 1 Green and 1 Yellow token.

### File: CZ_CharacterCards_Maelstrom_Warlord.pdf
**Status:** [CORRECT]

### File: CZ_CharacterCards_Maelstrom_Warlord_Vet1.pdf
**Status:** [INCORRECT]
**Errors Found:**
- Action Tokens: JSON has Green 2, Yellow 1. Card shows 1 Green and 1 Yellow token.

### File: CZ_CharacterCards_Maelstrom_Warlord_Vet2.pdf
**Status:** [INCORRECT]
**Errors Found:**
- Action Tokens: JSON has Green 2, Yellow 1. Card shows 3 Green tokens (and no Yellow tokens).
