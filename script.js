// DOM Elements
const journalForm = document.getElementById('journal-form');
const entriesList = document.getElementById('entries-list');
const quoteText = document.getElementById('quote-text');
const newQuoteBtn = document.getElementById('new-quote-btn');
const favoriteQuoteBtn = document.getElementById('favorite-quote-btn');
const favoritesCount = document.getElementById('favorites-count');
const filterButtons = document.querySelectorAll('.filter-btn');
const favoritesModal = document.getElementById('favorites-modal');
const closeModal = document.querySelector('.close');
const favoritesList = document.getElementById('favorites-list');

// Configuration
const API_BASE = 'https://my-json-server.typicode.com/ThePeterBwire/mindful-moments-journal';

// State Management
let currentQuote = null;
let favorites = [];
let entries = [];

// ----------------------------
// QUOTE SYSTEM
// ----------------------------
async function fetchQuote() {
  try {
    const response = await fetch('https://api.quotable.io/random');
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    currentQuote = {
      text: data.content,
      author: data.author || "Unknown"
    };
    quoteText.textContent = `"${currentQuote.text}" — ${currentQuote.author}`;
  } catch (error) {
    console.error('Quote Error:', error);
    quoteText.textContent = "Every day is a new opportunity 🌟";
  }
}

// ----------------------------
// FAVORITES SYSTEM (Memory Only)
// ----------------------------
function updateFavorites() {
  favoritesCount.textContent = favorites.length;
  favoritesList.innerHTML = favorites.map((quote, index) => `
    <div class="favorite-quote-item">
      <p>"${quote.text}" — ${quote.author}</p>
      <button onclick="favorites.splice(${index}, 1); updateFavorites()">🗑️</button>
    </div>
  `).join('');
}

// ----------------------------
// JOURNAL SYSTEM (Hybrid Approach)
// ----------------------------
async function loadInitialEntries() {
  try {
    const response = await fetch(`${API_BASE}/entries`);
    entries = await response.json();
  } catch (error) {
    console.log('Using empty entries array');
    entries = [];
  }
  renderEntries();
}

function renderEntries() {
  entriesList.innerHTML = entries.map(entry => `
    <div class="entry-card ${entry.mood}">
      <button class="delete-entry" data-id="${entry.id}">×</button>
      <p><strong>Mood:</strong> ${entry.mood}</p>
      <p>${entry.reflection}</p>
      <small>${new Date(entry.date).toLocaleDateString()}</small>
    </div>
  `).join('');
}

async function handleJournalSubmit(e) {
  e.preventDefault();
  
  const newEntry = {
    id: Date.now(),
    mood: document.getElementById('mood').value,
    reflection: document.getElementById('reflection').value,
    date: new Date().toISOString()
  };

  // Simulate POST (will not persist)
  try {
    await fetch(`${API_BASE}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    });
  } catch (error) {
    console.log('POST failed (expected)');
  }

  entries.push(newEntry);
  renderEntries();
  journalForm.reset();
}

function deleteEntry(entryId) {
  entries = entries.filter(entry => entry.id !== entryId);
  renderEntries();
}

// ----------------------------
// EVENT LISTENERS
// ----------------------------
journalForm.addEventListener('submit', handleJournalSubmit);

entriesList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-entry')) {
    const entryId = Number(e.target.dataset.id);
    deleteEntry(entryId);
  }
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const mood = button.dataset.mood;
    const filtered = mood === 'all' ? entries : entries.filter(e => e.mood === mood);
    entriesList.innerHTML = filtered.map(entry => `
      <div class="entry-card ${entry.mood}">
        <button class="delete-entry" data-id="${entry.id}">×</button>
        <p><strong>Mood:</strong> ${entry.mood}</p>
        <p>${entry.reflection}</p>
        <small>${new Date(entry.date).toLocaleDateString()}</small>
      </div>
    `).join('');
  });
});

newQuoteBtn.addEventListener('click', fetchQuote);
favoriteQuoteBtn.addEventListener('click', () => {
  if (currentQuote && !favorites.some(f => f.text === currentQuote.text)) {
    favorites.push(currentQuote);
    updateFavorites();
  }
});

// Modal Controls
favoritesCount.addEventListener('click', () => {
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

// ----------------------------
// INITIAL SETUP
// ----------------------------
(async function initializeApp() {
  await fetchQuote();
  await loadInitialEntries();
  renderEntries();
  updateFavorites();
})();