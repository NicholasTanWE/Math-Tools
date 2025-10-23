# Random Name/Number Picker

A simple web application for randomly selecting names from a CSV file or numbers from a specified range.

## Features

- Landing page with options for numbers or names
- For numbers: Enter a range (min to max), then randomize with or without repeats, clear history
- For names: Upload CSV file with names, then randomize with or without repeats
- Flourish effects on selection
- Option to upload new CSV or change range

## Usage

1. Open `index.html` in a web browser.
2. For numbers: Click "Randomize Numbers", enter min and max, click Proceed.
3. For names: Click "Randomize Names", upload CSV (one name per line), click Upload CSV. (Excel files are not supported; save as CSV.)
4. On the selection page, click buttons to randomize.
5. For numbers, use "Clear History" to reset used numbers.
6. Side panels show history of selected names/numbers.

## Files

- `index.html`: Landing page
- `selection.html`: Name randomization page
- `number-selection.html`: Number randomization page
- `script.js`: JavaScript functionality
- `style.css`: Styling

## Notes

- Names are stored in localStorage temporarily.
- Number range and used numbers are stored in localStorage.
