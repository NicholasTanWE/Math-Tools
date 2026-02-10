// Dice Roller Script

document.addEventListener('DOMContentLoaded', () => {
    const rollButton = document.getElementById('rollButton');
    const numDiceInput = document.getElementById('numDice');
    const numSidesInput = document.getElementById('numSides');
    const diceContainer = document.getElementById('diceContainer');
    const revealTotalBtn = document.getElementById('revealTotalBtn');
    const revealAvgBtn = document.getElementById('revealAvgBtn');
    const totalValue = document.getElementById('totalValue');
    const avgValue = document.getElementById('avgValue');

    let lastResults = [];

    function updatePanel() {
        // Hide values and untoggle buttons
        totalValue.style.display = 'none';
        avgValue.style.display = 'none';
        revealTotalBtn.classList.remove('toggled');
        revealAvgBtn.classList.remove('toggled');
    }

    rollButton.addEventListener('click', () => {
        const numDice = parseInt(numDiceInput.value);
        const numSides = parseInt(numSidesInput.value);
        // Validate input
        if (numSides < 3 || numSides > 20) {
            alert('Please enter a number of sides between 3 and 20');
            return;
        }
        diceContainer.innerHTML = '';
        lastResults = [];
        updatePanel();
        for (let i = 0; i < numDice; i++) {
            const die = document.createElement('div');
            die.className = `die die-${numSides}`;
            const number = document.createElement('span');
            number.className = 'number';
            number.textContent = '?';
            die.appendChild(number);
            diceContainer.appendChild(die);
            // Random delay for staggered effect
            const delay = i * 150;
            setTimeout(() => {
                // Start rolling animation
                die.classList.add('rolling');
                // Show random numbers during roll
                let count = 0;
                const interval = setInterval(() => {
                    number.textContent = Math.floor(Math.random() * numSides) + 1;
                    count++;
                    if (count > 8) {
                        clearInterval(interval);
                    }
                }, 100);
                // After animation completes, show final result
                setTimeout(() => {
                    const finalValue = Math.floor(Math.random() * numSides) + 1;
                    number.textContent = finalValue;
                    die.classList.remove('rolling');
                    lastResults[i] = finalValue;
                }, 800);
            }, delay);
        }
    });

    revealTotalBtn.addEventListener('click', () => {
        if (revealTotalBtn.classList.contains('toggled')) {
            revealTotalBtn.classList.remove('toggled');
            totalValue.style.display = 'none';
        } else {
            revealTotalBtn.classList.add('toggled');
            if (lastResults.length > 0 && lastResults.every(x => typeof x === 'number')) {
                totalValue.textContent = 'Total: ' + lastResults.reduce((a, b) => a + b, 0);
            } else {
                totalValue.textContent = 'Total: ?';
            }
            totalValue.style.display = 'inline-block';
        }
    });

    revealAvgBtn.addEventListener('click', () => {
        if (revealAvgBtn.classList.contains('toggled')) {
            revealAvgBtn.classList.remove('toggled');
            avgValue.style.display = 'none';
        } else {
            revealAvgBtn.classList.add('toggled');
            if (lastResults.length > 0 && lastResults.every(x => typeof x === 'number')) {
                const avg = lastResults.reduce((a, b) => a + b, 0) / lastResults.length;
                avgValue.textContent = 'Average: ' + avg.toFixed(2);
            } else {
                avgValue.textContent = 'Average: ?';
            }
            avgValue.style.display = 'inline-block';
        }
    });
});