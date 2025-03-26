
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

