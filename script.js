
const journalForm = document.getElementById('journal-form');
const entriesList = document.getElementById('entries-list');
const quoteText = document.getElementById('quote-text');
const newQuoteBtn = document.getElementById('new-quote-btn');
const filterButtons = document.querySelectorAll('.filter-btn');

function fetchQuote() {
  fetch('https://zenquotes.io/api/random')
  .then(response => response.json())
  .then(data => {
    quoteText.textContent = `"${data[0].q}" - ${data[0].a}`;
  })
  .catch(() => {
    quoteText.textContent = "Today is a gift that's why we call it the present!";
  });
}

function fetchEntries() {
  fetch('https:localhost:3000/entries')
  .then(response => response.json())
  .then(entries => renderEntries(entries));
}

function renderEntries(entries) {
  entriesList.innerHTML=''; 
  entries.forEach(entry => {
    const entryCard = document.createElement('div');
    entryCard.className = `entry-card ${entry.mood}`;
    entryCard.innerHTML = `
    <p><strong>Mood:</strong> ${entry.mood}</p>
    <p>${entry.reflection}</p>
    <small>${new Date(entry.date).toLocaleDateString()}</small>
    `;
    entriesList.appendChild(entryCard);
  });
}
