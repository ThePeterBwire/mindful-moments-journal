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
// JOURNAL SYSTEM
// ----------------------------
async function handleJournalSubmit(e) {
  e.preventDefault();
  
  try {
    const newEntry = {
      mood: document.getElementById('mood').value,
      reflection: document.getElementById('reflection').value,
      date: new Date().toISOString()
    };

    // Save entry
    await fetch('http://localhost:3000/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    });

    // Refresh entries
    await refreshEntries();
    journalForm.reset();

  } catch (error) {
    console.error('Journal Error:', error);
    alert('Failed to save entry. Please try again.');
  }
}

async function refreshEntries() {
  try {
    const response = await fetch('http://localhost:3000/entries');
    const entries = await response.json();
    renderEntries(entries);
  } catch (error) {
    console.error('Refresh Error:', error);
    entriesList.innerHTML = '<p>Could not load entries. Please refresh the page.</p>';
  }
}

function renderEntries(entries) {
  entriesList.innerHTML = entries.map(entry => `
    <div class="entry-card ${entry.mood}">
      <button class="delete-entry" data-id="${entry.id}">×</button>
      <p><strong>Mood:</strong> ${entry.mood}</p>
      <p>${entry.reflection}</p>
      <small>${new Date(entry.date).toLocaleDateString()}</small>
    </div>
  `).join('');
}

async function deleteEntry(entryId) {
  if (!confirm('Are you sure you want to delete this entry?')) return;
  
  try {
    await fetch(`http://localhost:3000/entries/${entryId}`, {
      method: 'DELETE'
    });
    await refreshEntries();
  } catch (error) {
    console.error('Delete Error:', error);
    alert('Failed to delete entry. Please try again.');
  }
}

// ----------------------------
// EVENT LISTENERS
// ----------------------------
journalForm.addEventListener('submit', handleJournalSubmit);

// Delete Entry (Event Delegation)
entriesList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-entry')) {
    const entryId = e.target.dataset.id;
    deleteEntry(entryId);
  }
});

filterButtons.forEach(button => {
  button.addEventListener('click', async () => {
    try {
      const mood = button.dataset.mood;
      const response = await fetch('http://localhost:3000/entries');
      const entries = await response.json();
      
      const filtered = mood === 'all' 
        ? entries 
        : entries.filter(e => e.mood === mood);
        
      renderEntries(filtered);
    } catch (error) {
      console.error('Filter Error:', error);
    }
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
(async function initializeApp() {
  await fetchQuote();
  await refreshEntries();
  updateFavorites();
})();