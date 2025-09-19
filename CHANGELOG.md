# Changelog

All notable changes to this repository are documented in this file.

## 2025-09-19 — Updates by developer

- Landing page: updated `Math Dungeon Adventure` suggested level to "Primary 2 - 6" and added note about decimal and scale modes.
- Root site: added short capability lists for measurement projects to make features more discoverable.
- Math Dungeon Adventure:
  - Added full "Division by 10 / 100 / 1000" mode with four difficulty variants:
    - whole numbers ÷ 10/100/1000 (integer quotients)
    - whole numbers ÷ multiples of 10/100/1000 (integer quotients)
    - decimals and whole numbers ÷ 10/100/1000 (answers up to 3 decimal places)
    - decimals and whole numbers ÷ multiples of 10/100/1000 (answers up to 3 decimal places)
  - Ensured generators produce integer quotients where required and limited decimal results to at most 3 decimal places where requested.
  - Improved correct-answer display: trimming unnecessary trailing zeros in decimal answers (e.g. `4.050` displayed and accepted as `4.05`).


> Note: Please run a browser smoke test by opening `index.html` and testing the Math Dungeon Adventure "Multiply by 10/100/1000" and "Division by 10/100/1000" modes across difficulties to verify runtime behavior and formatting.
