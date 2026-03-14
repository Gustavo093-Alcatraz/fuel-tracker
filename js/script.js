const body = document.body;
const modeToggle = document.getElementById('modeToggle');
const dynamicCard = document.getElementById('dynamicCard');
let currentFuel = "Gasolina";

// Toggle Dark Mode
modeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    modeToggle.innerText = isDark ? "MODE: DARK" : "MODE: LIGHT";
});

// Set Active Fuel Type
function setFuel(btn, type) {
    document.querySelectorAll('.fuel-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFuel = type;

    // If a post is already selected, update its price simulation
    if (!dynamicCard.classList.contains('empty')) {
        const title = dynamicCard.querySelector('h2').innerText;
        // Simple random price variation for simulation
        const mockPrice = (5 + Math.random()).toFixed(2);
        showPost(title, `R$ ${mockPrice}`);
    }
}

// Show Post Details
function showPost(name, price) {
    dynamicCard.classList.remove('empty');

    const now = new Date();
    const timeString = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0');

    dynamicCard.innerHTML = `
        <div class="post-details">
            <span class="filter-label" style="color: var(--accent-color); background: #000; padding: 2px 5px;">STATION_ID_OK</span>
            <h2 style="margin-top: 10px">${name}</h2>
            <div class="filter-label">${currentFuel}</div>
            <div class="price-tag">${price}</div>
            <div class="update-time">Última atualização: Hoje, ${timeString}</div>
        </div>
    `;

    // Visual feedback on click
    const card = document.querySelector('.post-details');
    card.style.animation = 'none';
    card.offsetHeight; /* trigger reflow */
    card.style.animation = 'fadeIn 0.3s ease';
}
