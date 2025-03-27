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

// State Management
let currentQuote = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let entries = JSON.parse(localStorage.getItem('journalEntries')) || [];

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
// FAVORITES SYSTEM
// ----------------------------
function updateFavorites() {
  favoritesCount.textContent = favorites.length;
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  favoritesList.innerHTML = favorites.map((quote, index) => `
    <div class="favorite-quote-item">
      <p>"${quote.text}" — ${quote.author}</p>
      <button onclick="removeFavorite(${index})">🗑️</button>
    </div>
  `).join('');
}

function addToFavorites() {
  if (currentQuote && !favorites.some(f => f.text === currentQuote.text)) {
    favorites.push(currentQuote);
    updateFavorites();
  }
}

function removeFavorite(index) {
  favorites.splice(index, 1);
  updateFavorites();
}

// ----------------------------
// JOURNAL SYSTEM (LOCALSTORAGE)
// ----------------------------
function saveEntries() {
  localStorage.setItem('journalEntries', JSON.stringify(entries));
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

function handleJournalSubmit(e) {
  e.preventDefault();
  
  const newEntry = {
    id: Date.now(), // Unique ID
    mood: document.getElementById('mood').value,
    reflection: document.getElementById('reflection').value,
    date: new Date().toISOString()
  };

  entries = [...entries, newEntry];
  saveEntries();
  renderEntries();
  journalForm.reset();
}

function deleteEntry(entryId) {
  if (!confirm('Are you sure you want to delete this entry?')) return;
  entries = entries.filter(entry => entry.id !== entryId);
  saveEntries();
  renderEntries();
}

function filterEntries(mood) {
  const filtered = mood === 'all' ? entries : entries.filter(e => e.mood === mood);
  entriesList.innerHTML = filtered.map(entry => `
    <div class="entry-card ${entry.mood}">
      <button class="delete-entry" data-id="${entry.id}">×</button>
      <p><strong>Mood:</strong> ${entry.mood}</p>
      <p>${entry.reflection}</p>
      <small>${new Date(entry.date).toLocaleDateString()}</small>
    </div>
  `).join('');
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
    filterEntries(button.dataset.mood);
  });
});

newQuoteBtn.addEventListener('click', fetchQuote);
favoriteQuoteBtn.addEventListener('click', addToFavorites);

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
(function initializeApp() {
  fetchQuote();
  renderEntries();
  updateFavorites();
})();