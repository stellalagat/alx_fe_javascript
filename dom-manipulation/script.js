// Array to store quotes with text and category
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "motivation" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "innovation" },
  { text: "Life is what happens to you while you're busy making other plans.", category: "life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "dreams" },
  { text: "It is during our darkest moments that we must focus to see the light.", category: "inspiration" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "success" },
  { text: "The only impossible journey is the one you never begin.", category: "motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "opportunity" },
  { text: "Believe you can and you're halfway there.", category: "belief" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", category: "action" }
];

// DOM elements
let quoteDisplay;
let newQuoteButton;
let toggleFormButton;
let categoryFilter;
let addQuoteForm = null;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Get DOM elements
  quoteDisplay = document.getElementById('quoteDisplay');
  newQuoteButton = document.getElementById('newQuote');
  toggleFormButton = document.getElementById('toggleForm');
  categoryFilter = document.getElementById('categoryFilter');
  
  // Add event listeners
  newQuoteButton.addEventListener('click', showRandomQuote);
  toggleFormButton.addEventListener('click', toggleAddQuoteForm);
  categoryFilter.addEventListener('change', handleCategoryFilter);
  
  // Initialize category filter
  populateCategoryFilter();
  
  // Show initial quote
  showRandomQuote();
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes = quotes;
  
  // Filter quotes by category if not "all"
  if (selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  
  if (filteredQuotes.length === 0) {
    displayQuote("No quotes available for this category.", "");
    return;
  }
  
  // Get random quote from filtered quotes
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex];
  
  displayQuote(selectedQuote.text, selectedQuote.category);
}

function displayQuote(text, category) {
  // Clear existing content
  quoteDisplay.innerHTML = '';
  
  // Create quote container
  const quoteContainer = document.createElement('div');
  
  // Create quote text element
  const quoteText = document.createElement('div');
  quoteText.className = 'quote-text';
  quoteText.textContent = `"${text}"`;
  
  // Create category element if category exists
  if (category) {
    const quoteCategory = document.createElement('div');
    quoteCategory.className = 'quote-category';
    quoteCategory.textContent = `Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    quoteContainer.appendChild(quoteText);
    quoteContainer.appendChild(quoteCategory);
  } else {
    quoteContainer.appendChild(quoteText);
  }
  
  // Add animation effect
  quoteContainer.style.opacity = '0';
  quoteDisplay.appendChild(quoteContainer);
  
  // Fade in animation
  setTimeout(() => {
    quoteContainer.style.transition = 'opacity 0.5s ease-in';
    quoteContainer.style.opacity = '1';
  }, 50);
}

function toggleAddQuoteForm() {
  if (addQuoteForm) {
    // Remove existing form
    addQuoteForm.remove();
    addQuoteForm = null;
    toggleFormButton.textContent = 'Add New Quote';
  } else {
    // Create new form
    createAddQuoteForm();
    toggleFormButton.textContent = 'Hide Form';
  }
}

function createAddQuoteForm() {
  // Create form container
  addQuoteForm = document.createElement('div');
  addQuoteForm.className = 'form-container';
  addQuoteForm.id = 'addQuoteForm';
  
  // Create form title
  const formTitle = document.createElement('h3');
  formTitle.textContent = 'Add a New Quote';
  formTitle.style.textAlign = 'center';
  formTitle.style.marginBottom = '20px';
  formTitle.style.color = '#333';
  
  // Create quote text input
  const quoteTextInput = document.createElement('input');
  quoteTextInput.type = 'text';
  quoteTextInput.id = 'newQuoteText';
  quoteTextInput.placeholder = 'Enter a new quote';
  quoteTextInput.required = true;
  
  // Create category input
  const quoteCategoryInput = document.createElement('input');
  quoteCategoryInput.type = 'text';
  quoteCategoryInput.id = 'newQuoteCategory';
  quoteCategoryInput.placeholder = 'Enter quote category';
  quoteCategoryInput.required = true;
  
  // Create add button
  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.style.width = '100%';
  addButton.style.marginTop = '10px';
  addButton.addEventListener('click', addQuote);
  
  // Create validation message container
  const messageContainer = document.createElement('div');
  messageContainer.id = 'messageContainer';
  messageContainer.style.marginTop = '10px';
  messageContainer.style.textAlign = 'center';
  
  // Assemble form
  addQuoteForm.appendChild(formTitle);
  addQuoteForm.appendChild(quoteTextInput);
  addQuoteForm.appendChild(quoteCategoryInput);
  addQuoteForm.appendChild(addButton);
  addQuoteForm.appendChild(messageContainer);
  
  // Insert form after the button container
  const buttonContainer = document.querySelector('.button-container');
  buttonContainer.parentNode.insertBefore(addQuoteForm, buttonContainer.nextSibling);
  
  // Add enter key support
  quoteTextInput.addEventListener('keypress', handleEnterKey);
  quoteCategoryInput.addEventListener('keypress', handleEnterKey);
  
  // Focus on first input
  quoteTextInput.focus();
}

function handleEnterKey(event) {
  if (event.key === 'Enter') {
    addQuote();
  }
}

function addQuote() {
  const quoteTextInput = document.getElementById('newQuoteText');
  const quoteCategoryInput = document.getElementById('newQuoteCategory');
  const messageContainer = document.getElementById('messageContainer');
  
  const newQuoteText = quoteTextInput.value.trim();
  const newQuoteCategory = quoteCategoryInput.value.trim().toLowerCase();
  
  // Clear previous messages
  messageContainer.innerHTML = '';
  
  // Validate inputs
  if (!newQuoteText || !newQuoteCategory) {
    showMessage('Please fill in both fields.', 'error');
    return;
  }
  
  if (newQuoteText.length < 10) {
    showMessage('Quote must be at least 10 characters long.', 'error');
    return;
  }
  
  // Check for duplicate quotes
  const isDuplicate = quotes.some(quote => 
    quote.text.toLowerCase() === newQuoteText.toLowerCase()
  );
  
  if (isDuplicate) {
    showMessage('This quote already exists!', 'error');
    return;
  }
  
  // Add new quote to array
  const newQuote = {
    text: newQuoteText,
    category: newQuoteCategory
  };
  
  quotes.push(newQuote);
  
  // Update category filter
  populateCategoryFilter();
  
  // Clear form inputs
  quoteTextInput.value = '';
  quoteCategoryInput.value = '';
  
  // Show success message
  showMessage(`Quote added successfully to "${newQuoteCategory}" category!`, 'success');
  
  // Display the new quote
  displayQuote(newQuote.text, newQuote.category);
  
  // Auto-hide form after successful addition
  setTimeout(() => {
    if (addQuoteForm) {
      toggleAddQuoteForm();
    }
  }, 2000);
}

function showMessage(message, type) {
  const messageContainer = document.getElementById('messageContainer');
  messageContainer.innerHTML = '';
  
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messageElement.style.padding = '10px';
  messageElement.style.borderRadius = '5px';
  messageElement.style.marginTop = '10px';
  
  if (type === 'success') {
    messageElement.style.backgroundColor = '#d4edda';
    messageElement.style.color = '#155724';
    messageElement.style.border = '1px solid #c3e6cb';
  } else if (type === 'error') {
    messageElement.style.backgroundColor = '#f8d7da';
    messageElement.style.color = '#721c24';
    messageElement.style.border = '1px solid #f5c6cb';
  }
  
  messageContainer.appendChild(messageElement);
  
  // Auto-remove message after 3 seconds
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.remove();
    }
  }, 3000);
}

function populateCategoryFilter() {
  // Get unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))].sort();
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    categoryFilter.appendChild(option);
  });
}

function handleCategoryFilter() {
  showRandomQuote();
}

// Export functions for potential testing or external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showRandomQuote,
    createAddQuoteForm,
    addQuote,
    quotes
  };
}