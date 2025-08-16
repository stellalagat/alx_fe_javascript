// Default quotes array - used as fallback if no stored quotes exist
const defaultQuotes = [
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

// Array to store quotes - will be loaded from localStorage
let quotes = [];

// DOM elements
let quoteDisplay;
let newQuoteButton;
let toggleFormButton;
let categoryFilter;
let exportButton;
let clearStorageButton;
let importFileInput;
let importStatus;
let storageStats;
let addQuoteForm = null;

// Storage keys
const STORAGE_KEYS = {
  QUOTES: 'quoteGenerator_quotes',
  LAST_QUOTE: 'quoteGenerator_lastQuote',
  USER_PREFERENCES: 'quoteGenerator_preferences'
};

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
  exportButton = document.getElementById('exportQuotes');
  clearStorageButton = document.getElementById('clearStorage');
  importFileInput = document.getElementById('importFile');
  importStatus = document.getElementById('importStatus');
  storageStats = document.getElementById('storageStats');
  
  // Load quotes from localStorage
  loadQuotes();
  
  // Load user preferences from sessionStorage
  loadUserPreferences();
  
  // Add event listeners
  newQuoteButton.addEventListener('click', showRandomQuote);
  toggleFormButton.addEventListener('click', toggleAddQuoteForm);
  categoryFilter.addEventListener('change', handleCategoryFilter);
  exportButton.addEventListener('click', exportQuotes);
  clearStorageButton.addEventListener('click', clearAllData);
  importFileInput.addEventListener('change', importFromJsonFile);
  
  // Initialize category filter
  populateCategoryFilter();
  
  // Update storage statistics
  updateStorageStats();
  
  // Show last viewed quote or random quote
  showLastQuoteOrRandom();
}

// ===== WEB STORAGE FUNCTIONS =====

function loadQuotes() {
  try {
    const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (storedQuotes) {
      quotes = JSON.parse(storedQuotes);
      console.log('Loaded', quotes.length, 'quotes from localStorage');
    } else {
      // Use default quotes if no stored quotes exist
      quotes = [...defaultQuotes];
      saveQuotes(); // Save default quotes to localStorage
      console.log('Initialized with default quotes');
    }
  } catch (error) {
    console.error('Error loading quotes from localStorage:', error);
    quotes = [...defaultQuotes];
    showStorageMessage('Error loading saved quotes. Using default quotes.', 'error');
  }
}

function saveQuotes() {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    updateStorageStats();
    console.log('Saved', quotes.length, 'quotes to localStorage');
  } catch (error) {
    console.error('Error saving quotes to localStorage:', error);
    showStorageMessage('Error saving quotes to storage.', 'error');
  }
}

function saveLastQuote(quote) {
  try {
    const lastQuoteData = {
      quote: quote,
      timestamp: new Date().toISOString(),
      category: categoryFilter.value
    };
    sessionStorage.setItem(STORAGE_KEYS.LAST_QUOTE, JSON.stringify(lastQuoteData));
  } catch (error) {
    console.error('Error saving last quote to sessionStorage:', error);
  }
}

function loadUserPreferences() {
  try {
    const preferences = sessionStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (preferences) {
      const prefs = JSON.parse(preferences);
      if (prefs.selectedCategory && categoryFilter) {
        categoryFilter.value = prefs.selectedCategory;
      }
    }
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
}

function saveUserPreferences() {
  try {
    const preferences = {
      selectedCategory: categoryFilter.value,
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
}

function showLastQuoteOrRandom() {
  try {
    const lastQuoteData = sessionStorage.getItem(STORAGE_KEYS.LAST_QUOTE);
    if (lastQuoteData) {
      const data = JSON.parse(lastQuoteData);
      const timeDiff = new Date() - new Date(data.timestamp);
      
      // Show last quote if it was viewed within the last hour
      if (timeDiff < 3600000) { // 1 hour in milliseconds
        displayQuote(data.quote.text, data.quote.category);
        if (data.category && data.category !== 'all') {
          categoryFilter.value = data.category;
        }
        return;
      }
    }
  } catch (error) {
    console.error('Error loading last quote:', error);
  }
  
  // Show random quote if no recent last quote
  showRandomQuote();
}

// ===== QUOTE DISPLAY FUNCTIONS =====

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
  
  // Save as last viewed quote
  saveLastQuote(selectedQuote);
  
  // Save user preferences
  saveUserPreferences();
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

// ===== FORM HANDLING FUNCTIONS =====

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
  
  // Save to localStorage
  saveQuotes();
  
  // Update category filter
  populateCategoryFilter();
  
  // Clear form inputs
  quoteTextInput.value = '';
  quoteCategoryInput.value = '';
  
  // Show success message
  showMessage(`Quote added successfully to "${newQuoteCategory}" category!`, 'success');
  
  // Display the new quote
  displayQuote(newQuote.text, newQuote.category);
  
  // Save as last viewed quote
  saveLastQuote(newQuote);
  
  // Auto-hide form after successful addition
  setTimeout(() => {
    if (addQuoteForm) {
      toggleAddQuoteForm();
    }
  }, 2000);
}

// ===== JSON IMPORT/EXPORT FUNCTIONS =====

function exportQuotes() {
  try {
    const dataToExport = {
      quotes: quotes,
      exportDate: new Date().toISOString(),
      version: "1.0",
      totalQuotes: quotes.length
    };
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `quotes-export-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
    
    showStorageMessage(`Successfully exported ${quotes.length} quotes!`, 'success');
    
  } catch (error) {
    console.error('Error exporting quotes:', error);
    showStorageMessage('Error exporting quotes. Please try again.', 'error');
  }
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.name.toLowerCase().endsWith('.json')) {
    showImportStatus('Please select a valid JSON file.', 'error');
    return;
  }
  
  const fileReader = new FileReader();
  
  fileReader.onload = function(e) {
    try {
      const fileContent = e.target.result;
      let importedData;
      
      // Parse JSON
      try {
        importedData = JSON.parse(fileContent);
      } catch (parseError) {
        showImportStatus('Invalid JSON file format.', 'error');
        return;
      }
      
      // Validate imported data structure
      let importedQuotes;
      if (Array.isArray(importedData)) {
        // Direct array of quotes
        importedQuotes = importedData;
      } else if (importedData.quotes && Array.isArray(importedData.quotes)) {
        // Exported format with metadata
        importedQuotes = importedData.quotes;
      } else {
        showImportStatus('Invalid file structure. Expected array of quotes.', 'error');
        return;
      }
      
      // Validate quote objects
      const validQuotes = [];
      const invalidQuotes = [];
      
      importedQuotes.forEach((quote, index) => {
        if (quote && typeof quote.text === 'string' && typeof quote.category === 'string') {
          // Check for duplicates
          const isDuplicate = quotes.some(existingQuote => 
            existingQuote.text.toLowerCase() === quote.text.toLowerCase()
          );
          
          if (!isDuplicate) {
            validQuotes.push({
              text: quote.text.trim(),
              category: quote.category.trim().toLowerCase()
            });
          }
        } else {
          invalidQuotes.push(index + 1);
        }
      });
      
      if (validQuotes.length === 0) {
        showImportStatus('No valid quotes found in the file or all quotes already exist.', 'error');
        return;
      }
      
      // Add valid quotes to the array
      quotes.push(...validQuotes);
      
      // Save to localStorage
      saveQuotes();
      
      // Update UI
      populateCategoryFilter();
      
      // Show success message
      let message = `Successfully imported ${validQuotes.length} quotes!`;
      if (invalidQuotes.length > 0) {
        message += ` (${invalidQuotes.length} invalid quotes skipped)`;
      }
      showImportStatus(message, 'success');
      
      // Clear file input
      event.target.value = '';
      
      // Show a random quote from imported ones
      if (validQuotes.length > 0) {
        const randomImported = validQuotes[Math.floor(Math.random() * validQuotes.length)];
        displayQuote(randomImported.text, randomImported.category);
      }
      
    } catch (error) {
      console.error('Error importing quotes:', error);
      showImportStatus('Error processing file. Please check the file format.', 'error');
    }
  };
  
  fileReader.onerror = function() {
    showImportStatus('Error reading file. Please try again.', 'error');
  };
  
  fileReader.readAsText(file);
}

// ===== STORAGE MANAGEMENT FUNCTIONS =====

function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This will remove all quotes and cannot be undone.')) {
    try {
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.QUOTES);
      
      // Clear sessionStorage
      sessionStorage.removeItem(STORAGE_KEYS.LAST_QUOTE);
      sessionStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
      
      // Reset to default quotes
      quotes = [...defaultQuotes];
      saveQuotes();
      
      // Reset UI
      populateCategoryFilter();
      categoryFilter.value = 'all';
      showRandomQuote();
      
      showStorageMessage('All data cleared successfully. Reset to default quotes.', 'success');
      
    } catch (error) {
      console.error('Error clearing data:', error);
      showStorageMessage('Error clearing data. Please try again.', 'error');
    }
  }
}

function updateStorageStats() {
  try {
    const quotesSize = new Blob([localStorage.getItem(STORAGE_KEYS.QUOTES) || '']).size;
    const categories = [...new Set(quotes.map(quote => quote.category))].length;
    
    storageStats.innerHTML = `
      <strong>Storage Statistics:</strong><br>
      Total Quotes: ${quotes.length} | 
      Categories: ${categories} | 
      Storage Used: ${(quotesSize / 1024).toFixed(2)} KB
    `;
  } catch (error) {
    storageStats.textContent = 'Storage statistics unavailable';
  }
}

// ===== UTILITY FUNCTIONS =====

function showMessage(message, type) {
  const messageContainer = document.getElementById('messageContainer');
  if (!messageContainer) return;
  
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

function showStorageMessage(message, type) {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messageElement.className = type === 'success' ? 'success-status' : 'error-status';
  messageElement.style.padding = '10px';
  messageElement.style.borderRadius = '5px';
  messageElement.style.marginTop = '10px';
  messageElement.style.textAlign = 'center';
  
  // Insert after storage controls
  const storageControls = document.querySelector('.storage-controls');
  storageControls.appendChild(messageElement);
  
  // Auto-remove message after 4 seconds
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.remove();
    }
  }, 4000);
}

function showImportStatus(message, type) {
  importStatus.textContent = message;
  importStatus.className = `import-status ${type === 'success' ? 'success-status' : 'error-status'}`;
  
  // Auto-clear status after 4 seconds
  setTimeout(() => {
    importStatus.textContent = '';
    importStatus.className = 'import-status';
  }, 4000);
}

function populateCategoryFilter() {
  // Get unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))].sort();
  
  // Store current selection
  const currentSelection = categoryFilter.value;
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    categoryFilter.appendChild(option);
  });
  
  // Restore selection if it still exists
  if (categories.includes(currentSelection)) {
    categoryFilter.value = currentSelection;
  }
  
  // Update storage stats
  updateStorageStats();
}

function handleCategoryFilter() {
  showRandomQuote();
  saveUserPreferences();
}

// Export functions for potential testing or external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showRandomQuote,
    createAddQuoteForm,
    addQuote,
    exportQuotes,
    importFromJsonFile,
    loadQuotes,
    saveQuotes,
    quotes
  };
}