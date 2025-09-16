# Math Tools Repository


# Math Tools Repository

A collection of interactive mini-sites for primary school students to visualize math concepts. Designed for easy maintenance and extension by educators.

## Structure
```
Root/
├── index.html (landing page)
├── README.md
├── style-guide/
│   ├── colors.css
│   ├── typography.css  
│   ├── layout.css
│   ├── components.css
│   └── template.html
├── angles-in-triangle/
│   ├── index.html
│   ├── script.js
│   └── style.css
└── [future mini-project folders]/
```

## How to Add New Mini-Projects
1. Create a new folder in the root directory (use clear, kebab-case names).
2. Add `index.html`, `script.js`, and `style.css` files.
3. Import CSS from `../style-guide/` in your HTML.
4. Update the landing page table with the new project.

## Style Guide Usage
Import CSS files from `style-guide/` in your HTML files for consistent design. See `style-guide/template.html` for examples.

## Local Testing & Deployment
- Open any HTML file in your browser to test locally.
- Compatible with GitHub Pages for easy hosting.

## Example: Adding a New Project
```
math-tools-repository/
├── new-mini-project/
│   ├── index.html
│   ├── script.js
│   └── style.css
```

## About "Angles in a Triangle"
This mini-project lets students interactively explore the sum of angles in a triangle. Drag the vertices to change the triangle and observe how the angles always sum to 180°.

---

For questions or suggestions, contact the repository maintainer.
