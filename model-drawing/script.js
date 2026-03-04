// Model Drawing Tool - Initial Scaffold
// All logic will be implemented here

document.getElementById('addBarBtn').addEventListener('click', () => {
    addBar();
});
document.getElementById('addUnitBarBtn').addEventListener('click', () => {
    addUnitBar();
});
document.getElementById('addBraceBtn').addEventListener('click', () => {
    addBraceLabel();
});
document.getElementById('addTextBoxBtn').addEventListener('click', () => {
    addTextBox();
});
// Add a bar made of equal-sized units
function addUnitBar(unitCount = 1) {
    const barHeight = 40;
    const unitWidth = 80;
    const margin = 20;
    const barWidth = unitCount * unitWidth;
    // Calculate y position based on number of bars
    const existingBars = svg.querySelectorAll('.bar-rect, .unit-bar-group').length;
    const y = margin + existingBars * (barHeight + margin);
    const x = margin;
    const groupId = 'unitbar-' + (barIdCounter++);

    // Group for all units (for future manipulation)
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.classList.add('unit-bar-group');
    group.setAttribute('data-bar-id', groupId);
    group.setAttribute('transform', 'translate(0,0)');
    group.addEventListener('mousedown', startDragUnitBar);

    for (let i = 0; i < unitCount; i++) {
        const unit = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        unit.setAttribute('x', x + i * unitWidth);
        unit.setAttribute('y', y);
        unit.setAttribute('width', unitWidth);
        unit.setAttribute('height', barHeight);
        unit.setAttribute('fill', '#d6f5d6');
        unit.setAttribute('stroke', '#3a7d3a');
        unit.setAttribute('stroke-width', 2);
        unit.classList.add('unit-rect');
        unit.setAttribute('data-unit-index', i);
        group.appendChild(unit);

        // Add label for each unit
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x + i * unitWidth + unitWidth / 2);
        label.setAttribute('y', y + barHeight / 2 + 6);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '18');
        label.setAttribute('fill', '#2d5c2d');
        label.classList.add('unit-label');
        label.setAttribute('data-bar-id', groupId);
        label.setAttribute('data-unit-index', i);
        label.textContent = '?';
        label.addEventListener('dblclick', editBarLabel);
        group.appendChild(label);
    }

    svg.appendChild(group);
}
// Undo/redo/clear state
let history = [];
let future = [];

function saveState() {
    history.push(svg.innerHTML);
    if (history.length > 100) history.shift();
    future = [];
}

function undo() {
    if (history.length === 0) return;
    future.push(svg.innerHTML);
    svg.innerHTML = history.pop();
    rebindAllEvents();
}

function redo() {
    if (future.length === 0) return;
    history.push(svg.innerHTML);
    svg.innerHTML = future.pop();
    rebindAllEvents();
}

function clearAll() {
    saveState();
    svg.innerHTML = '';
}

document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);
document.getElementById('clearAllBtn').addEventListener('click', clearAll);

// Rebind events after undo/redo
function rebindAllEvents() {
    svg.querySelectorAll('.bar-rect').forEach(rect => {
        rect.addEventListener('mousedown', startDragBar);
    });
    svg.querySelectorAll('.resize-handle-right, .resize-handle-left').forEach(handle => {
        handle.addEventListener('mousedown', startResizeBar);
    });
    svg.querySelectorAll('.bar-label').forEach(label => {
        label.addEventListener('dblclick', editBarLabel);
    });
    svg.querySelectorAll('.unit-label').forEach(label => {
        label.addEventListener('dblclick', editBarLabel);
    });
    svg.querySelectorAll('.unit-bar-group').forEach(group => {
        group.addEventListener('mousedown', startDragUnitBar);
    });
    svg.querySelectorAll('.brace-group').forEach(group => {
        group.addEventListener('mousedown', startDragBrace);
    });
    svg.querySelectorAll('.brace-label').forEach(label => {
        label.addEventListener('dblclick', editBraceLabel);
    });
    svg.querySelectorAll('.brace-resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', startResizeBrace);
    });
    svg.querySelectorAll('.text-box').forEach(box => {
        box.addEventListener('mousedown', startDragTextBox);
    });
    svg.querySelectorAll('.text-box-content').forEach(text => {
        text.addEventListener('dblclick', editTextBox);
    });
    // Update color input value if needed
    document.getElementById('barColorInput').addEventListener('change', (e) => {
        selectedBarColor = e.target.value;
    });
}

// Placeholder for SVG canvas reference
const svg = document.getElementById('modelCanvas');

let barIdCounter = 1;
let braceIdCounter = 1;
let textBoxIdCounter = 1;
let selectedBarColor = '#e0e0e0'; // Default bar color

// Color picker listener
document.getElementById('barColorInput').addEventListener('change', (e) => {
    selectedBarColor = e.target.value;
});

function addBar() {
    saveState();
    const barWidth = 300;
    const barHeight = 40;
    const margin = 20;
    // Calculate y position based on number of bars
    const existingBars = svg.querySelectorAll('.bar-rect').length;
    const y = margin + existingBars * (barHeight + margin);
    const x = margin;

    // Main bar rectangle (no rounded corners)
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barWidth);
    rect.setAttribute('height', barHeight);
    rect.setAttribute('fill', selectedBarColor);
    rect.setAttribute('stroke', '#888');
    rect.setAttribute('stroke-width', 2);
    rect.classList.add('bar-rect');
    const barId = barIdCounter++;
    rect.setAttribute('data-bar-id', barId);

    // Add drag event listeners
    rect.addEventListener('mousedown', startDragBar);
    svg.appendChild(rect);

    // Add label (SVG text)
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x + barWidth / 2);
    label.setAttribute('y', y + barHeight / 2 + 6); // Vertically centered
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '20');
    label.setAttribute('fill', '#333');
    label.classList.add('bar-label');
    label.setAttribute('data-bar-id', barId);
    label.textContent = '?';
    label.addEventListener('dblclick', editBarLabel);
    svg.appendChild(label);

    // Add resize handle (small rectangle at right edge)
    const handleRight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    handleRight.setAttribute('x', x + barWidth - 2);
    handleRight.setAttribute('y', y);
    handleRight.setAttribute('width', 2);
    handleRight.setAttribute('height', barHeight);
    handleRight.setAttribute('fill', 'none');
    handleRight.setAttribute('stroke', '#888');
    handleRight.setAttribute('stroke-width', '2');
    handleRight.setAttribute('cursor', 'ew-resize');
    handleRight.classList.add('resize-handle-right');
    handleRight.setAttribute('data-bar-id', barId);
    handleRight.addEventListener('mousedown', startResizeBar);
    svg.appendChild(handleRight);

    // Add resize handle (small rectangle at left edge)
    const handleLeft = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    handleLeft.setAttribute('x', x);
    handleLeft.setAttribute('y', y);
    handleLeft.setAttribute('width', 2);
    handleLeft.setAttribute('height', barHeight);
    handleLeft.setAttribute('fill', 'none');
    handleLeft.setAttribute('stroke', '#888');
    handleLeft.setAttribute('stroke-width', '2');
    handleLeft.setAttribute('cursor', 'ew-resize');
    handleLeft.classList.add('resize-handle-left');
    handleLeft.setAttribute('data-bar-id', barId);
    handleLeft.addEventListener('mousedown', startResizeBar);
    svg.appendChild(handleLeft);
}

// Inline label editing for bars
function editBarLabel(e) {
    e.stopPropagation();
    const label = e.target;
    const barId = label.getAttribute('data-bar-id');
    const currentText = label.textContent;
    // Get label position
    let x = parseFloat(label.getAttribute('x'));
    let y = parseFloat(label.getAttribute('y'));
    
    // Check if label is inside a transformed group (unit bar)
    const parent = label.parentElement;
    if (parent && parent.classList.contains('unit-bar-group')) {
        const transform = parent.getAttribute('transform') || 'translate(0,0)';
        const match = /translate\(([\d.-]+),([\d.-]+)\)/.exec(transform);
        if (match) {
            x += parseFloat(match[1]);
            y += parseFloat(match[2]);
        }
    }
    
    // Create HTML input overlay
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.style.position = 'absolute';
    input.style.left = (svg.getBoundingClientRect().left + x - 40) + 'px';
    input.style.top = (svg.getBoundingClientRect().top + y - 20) + 'px';
    input.style.width = '80px';
    input.style.fontSize = '18px';
    input.style.textAlign = 'center';
    input.style.zIndex = 10;
    document.body.appendChild(input);
    input.focus();
    input.select();
    input.addEventListener('blur', () => {
        label.textContent = input.value || '?';
        document.body.removeChild(input);
    });
    input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
            input.blur();
        }
    });
}
// Resize logic for bars
let resizeBar = null;
let resizeBarRect = null;
let resizeStart = { mouseX: 0, startWidth: 0, startX: 0 };
let resizeDirection = null; // 'left' or 'right'

function startResizeBar(e) {
    e.stopPropagation();
    resizeBar = e.target;
    const barId = resizeBar.getAttribute('data-bar-id');
    resizeBarRect = svg.querySelector('.bar-rect[data-bar-id="' + barId + '"]');
    resizeStart.mouseX = e.clientX;
    resizeStart.startWidth = parseFloat(resizeBarRect.getAttribute('width'));
    resizeStart.startX = parseFloat(resizeBarRect.getAttribute('x'));
    resizeDirection = resizeBar.classList.contains('resize-handle-left') ? 'left' : 'right';
    document.addEventListener('mousemove', resizeBarMove);
    document.addEventListener('mouseup', endResizeBar);
}

function resizeBarMove(e) {
    if (!resizeBar || !resizeBarRect) return;
    let dx = e.clientX - resizeStart.mouseX;
    const barX = resizeStart.startX;
    const barId = resizeBarRect.getAttribute('data-bar-id');
    
    if (resizeDirection === 'right') {
        // Resize from right: change width, keep x fixed
        let newWidth = resizeStart.startWidth + dx;
        // Snap to grid (10px)
        newWidth = Math.round(newWidth / 10) * 10;
        // Minimum width
        newWidth = Math.max(40, newWidth);
        // Maximum width (stay within SVG)
        newWidth = Math.min(newWidth, svg.width.baseVal.value - barX);
        resizeBarRect.setAttribute('width', newWidth);
        // Move right handle
        const handleRight = svg.querySelector('.resize-handle-right[data-bar-id="' + barId + '"]');
        if (handleRight) {
            handleRight.setAttribute('x', barX + newWidth - 2);
        }
        // Move label
        const label = svg.querySelector('.bar-label[data-bar-id="' + barId + '"]');
        if (label) {
            label.setAttribute('x', barX + newWidth / 2);
        }
    } else if (resizeDirection === 'left') {
        // Resize from left: change x and width, keep right edge fixed
        let newX = resizeStart.startX + dx;
        let newWidth = resizeStart.startWidth - dx;
        // Snap to grid (10px)
        newX = Math.round(newX / 10) * 10;
        newWidth = Math.round(newWidth / 10) * 10;
        // Minimum width
        newWidth = Math.max(40, newWidth);
        // Keep within SVG bounds
        newX = Math.max(0, newX);
        // Adjust width if x went out of bounds
        if (newX > resizeStart.startX + resizeStart.startWidth - 40) {
            newX = resizeStart.startX + resizeStart.startWidth - 40;
            newWidth = 40;
        }
        resizeBarRect.setAttribute('x', newX);
        resizeBarRect.setAttribute('width', newWidth);
        // Move left handle
        const handleLeft = svg.querySelector('.resize-handle-left[data-bar-id="' + barId + '"]');
        if (handleLeft) {
            handleLeft.setAttribute('x', newX);
        }
        // Move label
        const label = svg.querySelector('.bar-label[data-bar-id="' + barId + '"]');
        if (label) {
            label.setAttribute('x', newX + newWidth / 2);
        }
    }
}

function endResizeBar() {
    document.removeEventListener('mousemove', resizeBarMove);
    document.removeEventListener('mouseup', endResizeBar);
    resizeBar = null;
    resizeBarRect = null;
}

// Drag and drop logic for bars
let dragBar = null;
let dragOffset = { x: 0, y: 0 };

function startDragBar(e) {
    dragBar = e.target;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const barX = parseFloat(dragBar.getAttribute('x'));
    const barY = parseFloat(dragBar.getAttribute('y'));
    dragOffset.x = mouseX - barX;
    dragOffset.y = mouseY - barY;
    document.addEventListener('mousemove', dragBarMove);
    document.addEventListener('mouseup', endDragBar);
}

function dragBarMove(e) {
    if (!dragBar) return;
    // Calculate new position
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;
    // Snap to grid (10px)
    newX = Math.round(newX / 10) * 10;
    newY = Math.round(newY / 10) * 10;
    // Keep within SVG bounds
    const barWidth = parseFloat(dragBar.getAttribute('width'));
    const barHeight = parseFloat(dragBar.getAttribute('height'));
    newX = Math.max(0, Math.min(newX, svg.width.baseVal.value - barWidth));
    newY = Math.max(0, Math.min(newY, svg.height.baseVal.value - barHeight));
    dragBar.setAttribute('x', newX);
    dragBar.setAttribute('y', newY);
    // Move associated resize handles
    const barId = dragBar.getAttribute('data-bar-id');
    const handleRight = svg.querySelector('.resize-handle-right[data-bar-id="' + barId + '"]');
    const handleLeft = svg.querySelector('.resize-handle-left[data-bar-id="' + barId + '"]');
    if (handleRight) {
        handleRight.setAttribute('x', newX + barWidth - 2);
        handleRight.setAttribute('y', newY);
    }
    if (handleLeft) {
        handleLeft.setAttribute('x', newX);
        handleLeft.setAttribute('y', newY);
    }
    // Move associated label
    const label = svg.querySelector('.bar-label[data-bar-id="' + barId + '"]');
    if (label) {
        label.setAttribute('x', newX + barWidth / 2);
        label.setAttribute('y', newY + barHeight / 2 + 6);
    }
}

function endDragBar() {
    document.removeEventListener('mousemove', dragBarMove);
    document.removeEventListener('mouseup', endDragBar);
    dragBar = null;
}

// Drag and drop for unit bars (group)
let dragUnitBar = null;
let dragUnitBarOffset = { x: 0, y: 0 };

function startDragUnitBar(e) {
    if (e.target.tagName === 'text') return; // Allow dblclick on labels
    dragUnitBar = e.currentTarget;
    // Get current transform
    const transform = dragUnitBar.getAttribute('transform') || 'translate(0,0)';
    const match = /translate\(([\d.-]+),([\d.-]+)\)/.exec(transform);
    const tx = match ? parseFloat(match[1]) : 0;
    const ty = match ? parseFloat(match[2]) : 0;
    dragUnitBarOffset.x = e.clientX - tx;
    dragUnitBarOffset.y = e.clientY - ty;
    document.addEventListener('mousemove', dragUnitBarMove);
    document.addEventListener('mouseup', endDragUnitBar);
}

function dragUnitBarMove(e) {
    if (!dragUnitBar) return;
    let newX = e.clientX - dragUnitBarOffset.x;
    let newY = e.clientY - dragUnitBarOffset.y;
    // Snap to grid (10px)
    newX = Math.round(newX / 10) * 10;
    newY = Math.round(newY / 10) * 10;
    dragUnitBar.setAttribute('transform', `translate(${newX},${newY})`);
}

function endDragUnitBar() {
    document.removeEventListener('mousemove', dragUnitBarMove);
    document.removeEventListener('mouseup', endDragUnitBar);
    dragUnitBar = null;
}

// Add brace label with editable text
function addBraceLabel() {
    saveState();
    const arrowWidth = 200;
    const arrowHeight = 8;
    const margin = 20;
    const braceId = 'brace-' + (braceIdCounter++);
    
    // Calculate position
    const existingBars = svg.querySelectorAll('.bar-rect, .unit-bar-group').length;
    const y = margin + existingBars * 80 + 60;
    const x = margin + 100;
    
    // Create group for arrow
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.classList.add('brace-group');
    group.setAttribute('data-brace-id', braceId);
    group.setAttribute('transform', `translate(${x},${y})`);
    group.addEventListener('mousedown', startDragBrace);
    
    // Draw horizontal line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', arrowWidth);
    line.setAttribute('y2', 0);
    line.setAttribute('stroke', '#333');
    line.setAttribute('stroke-width', 2);
    group.appendChild(line);
    
    // Left arrow head
    const leftArrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    leftArrow.setAttribute('points', `0,0 ${arrowHeight},${-arrowHeight/2} ${arrowHeight},${arrowHeight/2}`);
    leftArrow.setAttribute('fill', '#333');
    group.appendChild(leftArrow);
    
    // Right arrow head
    const rightArrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    rightArrow.setAttribute('points', `${arrowWidth},0 ${arrowWidth - arrowHeight},${-arrowHeight/2} ${arrowWidth - arrowHeight},${arrowHeight/2}`);
    rightArrow.setAttribute('fill', '#333');
    rightArrow.classList.add('right-arrow');
    group.appendChild(rightArrow);
    
    // Editable text label below arrow
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', arrowWidth / 2);
    label.setAttribute('y', 20);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '16');
    label.setAttribute('fill', '#333');
    label.classList.add('brace-label');
    label.setAttribute('data-brace-id', braceId);
    label.textContent = '?';
    label.addEventListener('dblclick', editBraceLabel);
    group.appendChild(label);
    
    // Resize handle on right
    const handleRight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    handleRight.setAttribute('x', arrowWidth - 2);
    handleRight.setAttribute('y', -10);
    handleRight.setAttribute('width', 2);
    handleRight.setAttribute('height', 20);
    handleRight.setAttribute('fill', 'none');
    handleRight.setAttribute('stroke', '#888');
    handleRight.setAttribute('stroke-width', 2);
    handleRight.setAttribute('cursor', 'ew-resize');
    handleRight.classList.add('brace-resize-handle');
    handleRight.setAttribute('data-brace-id', braceId);
    handleRight.addEventListener('mousedown', startResizeBrace);
    group.appendChild(handleRight);
    
    svg.appendChild(group);
}

// Edit brace label text
function editBraceLabel(e) {
    e.stopPropagation();
    const label = e.target;
    const currentText = label.textContent;
    
    // Get label position relative to viewport
    const svgRect = svg.getBoundingClientRect();
    const parent = label.parentElement;
    const transform = parent.getAttribute('transform') || 'translate(0,0)';
    const match = /translate\(([\d.-]+),([\d.-]+)\)/.exec(transform);
    const tx = match ? parseFloat(match[1]) : 0;
    const ty = match ? parseFloat(match[2]) : 0;
    
    const x = parseFloat(label.getAttribute('x'));
    const y = parseFloat(label.getAttribute('y'));
    
    // Create HTML input overlay
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.style.position = 'absolute';
    input.style.left = (svgRect.left + tx + x - 40) + 'px';
    input.style.top = (svgRect.top + ty + y - 15) + 'px';
    input.style.width = '80px';
    input.style.fontSize = '16px';
    input.style.textAlign = 'center';
    input.style.zIndex = 10;
    document.body.appendChild(input);
    input.focus();
    input.select();
    input.addEventListener('blur', () => {
        label.textContent = input.value || '?';
        document.body.removeChild(input);
    });
    input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
            input.blur();
        }
    });
}

// Drag and drop for braces
let dragBrace = null;
let dragBraceOffset = { x: 0, y: 0 };
let resizeBrace = null;
let resizeBraceGroup = null;
let resizeBraceStart = { mouseX: 0, startWidth: 0 };

function startDragBrace(e) {
    if (e.target.tagName === 'text' || e.target.classList.contains('brace-resize-handle')) return;
    dragBrace = e.currentTarget;
    const transform = dragBrace.getAttribute('transform') || 'translate(0,0)';
    const match = /translate\(([\d.-]+),([\d.-]+)\)/.exec(transform);
    const tx = match ? parseFloat(match[1]) : 0;
    const ty = match ? parseFloat(match[2]) : 0;
    dragBraceOffset.x = e.clientX - tx;
    dragBraceOffset.y = e.clientY - ty;
    document.addEventListener('mousemove', dragBraceMove);
    document.addEventListener('mouseup', endDragBrace);
}

function dragBraceMove(e) {
    if (!dragBrace) return;
    let newX = e.clientX - dragBraceOffset.x;
    let newY = e.clientY - dragBraceOffset.y;
    // Snap to grid (10px)
    newX = Math.round(newX / 10) * 10;
    newY = Math.round(newY / 10) * 10;
    dragBrace.setAttribute('transform', `translate(${newX},${newY})`);
}

function endDragBrace() {
    document.removeEventListener('mousemove', dragBraceMove);
    document.removeEventListener('mouseup', endDragBrace);
    dragBrace = null;
}

// Resize brace
function startResizeBrace(e) {
    e.stopPropagation();
    resizeBrace = e.target;
    resizeBraceGroup = resizeBrace.parentElement;
    const line = resizeBraceGroup.querySelector('line');
    resizeBraceStart.startWidth = parseFloat(line.getAttribute('x2'));
    resizeBraceStart.mouseX = e.clientX;
    document.addEventListener('mousemove', resizeBraceMove);
    document.addEventListener('mouseup', endResizeBrace);
}

function resizeBraceMove(e) {
    if (!resizeBrace || !resizeBraceGroup) return;
    let dx = e.clientX - resizeBraceStart.mouseX;
    let newWidth = resizeBraceStart.startWidth + dx;
    newWidth = Math.round(newWidth / 10) * 10;
    newWidth = Math.max(60, newWidth);
    
    const line = resizeBraceGroup.querySelector('line');
    const rightArrow = resizeBraceGroup.querySelector('.right-arrow');
    const label = resizeBraceGroup.querySelector('.brace-label');
    
    // Update line
    line.setAttribute('x2', newWidth);
    
    // Update right arrow position
    const arrowHeight = 8;
    rightArrow.setAttribute('points', `${newWidth},0 ${newWidth - arrowHeight},${-arrowHeight/2} ${newWidth - arrowHeight},${arrowHeight/2}`);
    
    // Update label position
    label.setAttribute('x', newWidth / 2);
    
    // Update resize handle position
    resizeBrace.setAttribute('x', newWidth - 2);
}

function endResizeBrace() {
    document.removeEventListener('mousemove', resizeBraceMove);
    document.removeEventListener('mouseup', endResizeBrace);
    resizeBrace = null;
    resizeBraceGroup = null;
}

// Add text box
function addTextBox() {
    saveState();
    const textBoxWidth = 120;
    const textBoxHeight = 50;
    const padding = 10;
    const margin = 20;
    const textBoxId = 'textbox-' + (textBoxIdCounter++);
    
    // Calculate position
    const existingElements = svg.querySelectorAll('.bar-rect, .unit-bar-group, .brace-group').length;
    const y = margin + existingElements * 80 + 60;
    const x = margin + 100;
    
    // Create group for text box
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.classList.add('text-box');
    group.setAttribute('data-textbox-id', textBoxId);
    group.setAttribute('transform', `translate(${x},${y})`);
    group.addEventListener('mousedown', startDragTextBox);
    
    // Background rectangle
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', textBoxWidth);
    bg.setAttribute('height', textBoxHeight);
    bg.setAttribute('fill', '#fff');
    bg.setAttribute('rx', 4);
    group.appendChild(bg);
    
    // Text content
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', textBoxWidth / 2);
    text.setAttribute('y', textBoxHeight / 2 + 6);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '14');
    text.setAttribute('fill', '#333');
    text.classList.add('text-box-content');
    text.setAttribute('data-textbox-id', textBoxId);
    text.textContent = 'Text';
    text.addEventListener('dblclick', editTextBox);
    group.appendChild(text);
    
    svg.appendChild(group);
}

// Edit text box content
function editTextBox(e) {
    e.stopPropagation();
    const text = e.target;
    const currentText = text.textContent;
    
    // Get text position relative to viewport
    const svgRect = svg.getBoundingClientRect();
    const parent = text.parentElement;
    const transform = parent.getAttribute('transform') || 'translate(0,0)';
    const match = /translate\(([\d.-]+),([\d.-]+)\)/.exec(transform);
    const tx = match ? parseFloat(match[1]) : 0;
    const ty = match ? parseFloat(match[2]) : 0;
    
    const x = parseFloat(text.getAttribute('x'));
    const y = parseFloat(text.getAttribute('y'));
    
    // Create HTML input overlay
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.style.position = 'absolute';
    input.style.left = (svgRect.left + tx + x - 50) + 'px';
    input.style.top = (svgRect.top + ty + y - 15) + 'px';
    input.style.width = '100px';
    input.style.fontSize = '14px';
    input.style.textAlign = 'center';
    input.style.zIndex = 10;
    document.body.appendChild(input);
    input.focus();
    input.select();
    input.addEventListener('blur', () => {
        text.textContent = input.value || 'Text';
        document.body.removeChild(input);
    });
    input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
            input.blur();
        }
    });
}

// Drag and drop for text boxes
let dragTextBox = null;
let dragTextBoxOffset = { x: 0, y: 0 };

function startDragTextBox(e) {
    if (e.target.tagName === 'text') return; // Allow dblclick on text
    dragTextBox = e.currentTarget;
    const transform = dragTextBox.getAttribute('transform') || 'translate(0,0)';
    const match = /translate\(([\d.-]+),([\d.-]+)\)/.exec(transform);
    const tx = match ? parseFloat(match[1]) : 0;
    const ty = match ? parseFloat(match[2]) : 0;
    dragTextBoxOffset.x = e.clientX - tx;
    dragTextBoxOffset.y = e.clientY - ty;
    document.addEventListener('mousemove', dragTextBoxMove);
    document.addEventListener('mouseup', endDragTextBox);
}

function dragTextBoxMove(e) {
    if (!dragTextBox) return;
    let newX = e.clientX - dragTextBoxOffset.x;
    let newY = e.clientY - dragTextBoxOffset.y;
    // Snap to grid (10px)
    newX = Math.round(newX / 10) * 10;
    newY = Math.round(newY / 10) * 10;
    dragTextBox.setAttribute('transform', `translate(${newX},${newY})`);
}

function endDragTextBox() {
    document.removeEventListener('mousemove', dragTextBoxMove);
    document.removeEventListener('mouseup', endDragTextBox);
    dragTextBox = null;
}
