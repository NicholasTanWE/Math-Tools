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

## Mini-Project UI Guidelines

- For every mini-project, set the font-family for all elements to 'Segoe UI', 'Arial', sans-serif for full consistency. Example:
  ```css
  body, header.main-header h1, .instructions, .controls, .controls label, .controls input[type="number"], .controls input[readonly], button, .btn, .prompt, .canvas-wrapper {
      font-family: 'Segoe UI', 'Arial', sans-serif !important;
  }
  ```
- Use the style guide CSS variables for colors and layout.
- At the top of every mini-project page, add a link to return to the landing page. The link should:
  - Use the text "← Back to Landing Page"
  - Be styled with white color (`color: #fff`)
  - Have no extra whitespace below the link and above the page title
  - Example:
    ```html
    <nav style="margin: 0;">
      <a href="../index.html" style="font-size:1.1rem; text-decoration:underline; color:#fff;">← Back to Landing Page</a>
    </nav>
    <header class="main-header" style="margin-top:0;">
      <h1>Project Title</h1>
    </header>
    ```

---

For questions or suggestions, contact the repository maintainer.
