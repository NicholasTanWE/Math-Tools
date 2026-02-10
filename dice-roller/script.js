// Dice Roller Script

document.addEventListener('DOMContentLoaded', () => {
    const rollButton = document.getElementById('rollButton');
    const numDiceInput = document.getElementById('numDice');
    const numSidesInput = document.getElementById('numSides');
    const diceContainer = document.getElementById('diceContainer');

    rollButton.addEventListener('click', () => {
        const numDice = parseInt(numDiceInput.value);
        const numSides = parseInt(numSidesInput.value);
        
        // Validate input
        if (numSides < 3 || numSides > 20) {
            alert('Please enter a number of sides between 3 and 20');
            return;
        }
        
        diceContainer.innerHTML = '';

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
                }, 800);
            }, delay);
        }
    });
});