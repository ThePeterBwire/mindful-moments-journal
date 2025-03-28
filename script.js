// State Management
let currentQuote = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let entries = [];
const API_BASE = 'https://my-json-server.typicode.com/ThePeterBwire/mindful-moments-journal';

// DOM Elements
const favoritesModal = document.getElementById('favorites-modal');
const closeModal = document.querySelector('.close');

// Quote System
async function fetchQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        currentQuote = {
            text: data.content,
            author: data.author || "Unknown"
        };
        document.getElementById('quote-text').textContent = `"${currentQuote.text}" — ${currentQuote.author}`;
    } catch {
        document.getElementById('quote-text').textContent = "Today is a great day to start fresh!";
    }
}

// Favorites System
function updateFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    document.getElementById('favorites-count').textContent = favorites.length;
    
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = favorites.map((quote, index) => `
        <div class="favorite-quote-item">
            <p>"${quote.text}" — ${quote.author}</p>
            <button class="remove-favorite" data-index="${index}">🗑️</button>
        </div>
    `).join('');

    // Add delete handlers for favorites
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            favorites.splice(index, 1);
            updateFavorites();
        });
    });
}

// Journal System
async function loadEntries() {
    try {
        const response = await fetch(`${API_BASE}/entries`);
        entries = await response.json();
    } catch (error) {
        entries = JSON.parse(localStorage.getItem('entries')) || [];
    }
    renderEntries();
}

async function saveEntry(newEntry) {
    try {
        await fetch(`${API_BASE}/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEntry)
        });
    } catch (error) {
        localStorage.setItem('entries', JSON.stringify([...entries, newEntry]));
    }
    entries.push(newEntry);
    renderEntries();
}

async function deleteEntry(entryId) {
    try {
        await fetch(`${API_BASE}/entries/${entryId}`, {
            method: 'DELETE'
        });
    } catch (error) {
        console.error('Delete failed');
    }
    entries = entries.filter(entry => entry.id !== entryId);
    localStorage.setItem('entries', JSON.stringify(entries));
    renderEntries();
}

function renderEntries(filter = 'all') {
    const filtered = filter === 'all' ? entries : entries.filter(e => e.mood === filter);
    document.getElementById('entries-list').innerHTML = filtered.map(entry => `
        <div class="entry-card ${entry.mood}">
            <button class="delete-entry" data-id="${entry.id}">×</button>
            <p><strong>Mood:</strong> ${entry.mood}</p>
            <p>${entry.reflection}</p>
            <small>${new Date(entry.date).toLocaleDateString()}</small>
        </div>
    `).join('');
}

// Event Listeners
document.getElementById('journal-form').addEventListener('submit', async e => {
    e.preventDefault();
    const reflection = document.getElementById('reflection').value.trim();
    
    if (!reflection) {
        alert('Please write something before saving!');
        return;
    }

    const newEntry = {
        id: Date.now(),
        mood: document.getElementById('mood').value,
        reflection,
        date: new Date().toISOString()
    };
    
    await saveEntry(newEntry);
    e.target.reset();
});

document.getElementById('entries-list').addEventListener('click', async e => {
    if (e.target.classList.contains('delete-entry')) {
        const entryId = Number(e.target.dataset.id);
        await deleteEntry(entryId);
    }
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        renderEntries(btn.dataset.mood);
    });
});

document.getElementById('new-quote-btn').addEventListener('click', fetchQuote);
document.getElementById('favorite-quote-btn').addEventListener('click', () => {
    if (currentQuote && !favorites.some(fav => fav.text === currentQuote.text)) {
        favorites.push(currentQuote);
        updateFavorites();
    }
});

// Modal Controls
document.getElementById('favorites-count').addEventListener('click', () => {
    favoritesModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    favoritesModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === favoritesModal) {
        favoritesModal.style.display = 'none';
    }
});

// Initialization
fetchQuote();
loadEntries();
updateFavorites();