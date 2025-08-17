// Enhanced Dynamic Quote Generator with Advanced Filtering System
// Default quotes array - used as fallback if no stored quotes exist
const defaultQuotes = [
  { text: "The only way to do great work is to love what you do.", category: "motivation", id: 1, dateAdded: "2024-01-01", favorite: false },
  { text: "Innovation distinguishes between a leader and a follower.", category: "innovation", id: 2, dateAdded: "2024-01-02", favorite: false },
  { text: "Life is what happens to you while you're busy making other plans.", category: "life", id: 3, dateAdded: "2024-01-03", favorite: true },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "dreams", id: 4, dateAdded: "2024-01-04", favorite: false },
  { text: "It is during our darkest moments that we must focus to see the light.", category: "inspiration", id: 5, dateAdded: "2024-01-05", favorite: true },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "success", id: 6, dateAdded: "2024-01-06", favorite: false },
  { text: "The only impossible journey is the one you never begin.", category: "motivation", id: 7, dateAdded: "2024-01-07", favorite: false },
  { text: "In the middle of difficulty lies opportunity.", category: "opportunity", id: 8, dateAdded: "2024-01-08", favorite: true },
  { text: "Believe you can and you're halfway there.", category: "belief", id: 9, dateAdded: "2024-01-09", favorite: false },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", category: "action", id: 10, dateAdded: "2024-01-10", favorite: false }
];

// Array to store quotes - will be loaded from localStorage
let quotes = [];
let filteredQuotes = [];
let currentQuoteIndex = 0;

// DOM elements
let quoteDisplay;
let newQuoteButton;
let toggleFormButton;
let categoryFilter;
let categoryButtons;
let searchFilter;
let showFavorites;
let sortOrder;
let filterResults;
let categoryCount;
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
  USER_PREFERENCES: 'quoteGenerator_preferences',
  FILTER_PREFERENCES: 'quoteGenerator_filterPreferences',
  FAVORITES: 'quoteGenerator_favorites'
};

// Filter state
let currentFilters = {
  category: 'all',
  search: '',
  showFavorites: false,
  sortOrder: 'random'
};

// Alternative variable name for compatibility
let selectedCategory = 'all';

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
  categoryButtons = document.getElementById('categoryButtons');
  searchFilter = document.getElementById('searchFilter');
  showFavorites = document.getElementById('showFavorites');
  sortOrder = document.getElementById('sortOrder');
  filterResults = document.getElementById('filterResults');
  categoryCount = document.getElementById('categoryCount');
  exportButton = document.getElementById('exportQuotes');
  clearStorageButton = document.getElementById('clearStorage');
  importFileInput = document.getElementById('importFile');
  importStatus = document.getElementById('importStatus');
  storageStats = document.getElementById('storageStats');
  
  // Load quotes from localStorage
  loadQuotes();
  
  // Load filter preferences from localStorage
  loadFilterPreferences();
  
  // Load user preferences from sessionStorage
  loadUserPreferences();
  
  // Add event listeners
  newQuoteButton.addEventListener('click', showRandomQuote);
  toggleFormButton.addEventListener('click', toggleAddQuoteForm);
  exportButton.addEventListener('click', exportQuotes);
  clearStorageButton.addEventListener('click', clearAllData);
  importFileInput.addEventListener('change', importFromJsonFile);
  
  // Initialize filtering system
  populateCategories();
  
  // Apply initial filters
  filterQuotes();
  
  // Update storage statistics
  updateStorageStats();
  
  // Show initial quote
  showRandomQuote();
}

// ===== ENHANCED FILTERING SYSTEM =====

function populateCategories() {
  // Get unique categories from quotes
  const categories = [...new Set(quotes.map(quote => quote.category))].sort();
  
  // Store current selection
  const currentSelection = categoryFilter.value;
  
  // Clear and populate dropdown
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
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
  
  // Populate category buttons
  populateCategoryButtons(categories);
  
  // Update category count
  updateCategoryCount();
}

function populateCategoryButtons(categories) {
  categoryButtons.innerHTML = '';
  
  // Add "All" button
  const allButton = document.createElement('button');
  allButton.className = 'category-btn';
  allButton.textContent = 'All';
  allButton.onclick = () => selectCategoryButton('all');
  if (currentFilters.category === 'all') {
    allButton.classList.add('active');
  }
  categoryButtons.appendChild(allButton);
  
  // Add category buttons
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'category-btn';
    button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    button.onclick = () => selectCategoryButton(category);
    
    if (currentFilters.category === category) {
      button.classList.add('active');
    }
    
    categoryButtons.appendChild(button);
  });
}

function selectCategoryButton(category) {
  // Update filter state
  currentFilters.category = category;
  categoryFilter.value = category;
  
  // Update button states
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Apply filters and update display
  filterQuotes();
  
  // Save filter preferences
  saveFilterPreferences();
}

// Alternative function name that might be expected
function filterByCategory(selectedCategory) {
  // This function specifically handles category filtering
  // Update the category filter
  if (categoryFilter) {
    categoryFilter.value = selectedCategory;
  }
  
  // Update current filters
  currentFilters.category = selectedCategory;
  
  // Apply all filters
  filterQuotes();
  
  // Update category buttons if they exist
  updateCategoryButtonStates(selectedCategory);
}

function updateCategoryButtonStates(selectedCategory) {
  // Update button states to reflect current selection
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
    if ((selectedCategory === 'all' && btn.textContent === 'All') ||
        (btn.textContent.toLowerCase() === selectedCategory)) {
      btn.classList.add('active');
    }
  });
}

function filterQuotes() {
  // Get current filter values
  currentFilters.category = categoryFilter ? categoryFilter.value : 'all';
  currentFilters.search = searchFilter ? searchFilter.value.toLowerCase().trim() : '';
  currentFilters.showFavorites = showFavorites ? showFavorites.checked : false;
  currentFilters.sortOrder = sortOrder ? sortOrder.value : 'random';
  
  // Update selectedCategory for compatibility
  selectedCategory = currentFilters.category;
  
  // Start with all quotes
  filteredQuotes = [...quotes];
  
  // Apply category filter
  if (currentFilters.category !== 'all') {
    filteredQuotes = filteredQuotes.filter(quote => 
      quote.category === currentFilters.category
    );
  }
  
  // Apply search filter
  if (currentFilters.search) {
    filteredQuotes = filteredQuotes.filter(quote =>
      quote.text.toLowerCase().includes(currentFilters.search) ||
      quote.category.toLowerCase().includes(currentFilters.search)
    );
  }
  
  // Apply favorites filter
  if (currentFilters.showFavorites) {
    filteredQuotes = filteredQuotes.filter(quote => quote.favorite);
  }
  
  // Apply sorting
  applySorting();
  
  // Update UI
  updateFilterResults();
  updateCategoryCount();
  
  // Display filtered quotes (show all matching quotes or single quote based on preference)
  displayFilteredQuotes();
  
  // Save filter preferences
  saveFilterPreferences();
  
  // Reset quote index
  currentQuoteIndex = 0;
}

function applySorting() {
  switch (currentFilters.sortOrder) {
    case 'alphabetical':
      filteredQuotes.sort((a, b) => a.text.localeCompare(b.text));
      break;
    case 'category':
      filteredQuotes.sort((a, b) => a.category.localeCompare(b.category));
      break;
    case 'newest':
      filteredQuotes.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      break;
    case 'oldest':
      filteredQuotes.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
      break;
    case 'random':
    default:
      // Fisher-Yates shuffle for true randomization
      for (let i = filteredQuotes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredQuotes[i], filteredQuotes[j]] = [filteredQuotes[j], filteredQuotes[i]];
      }
      break;
  }
}

function updateFilterResults() {
  const totalQuotes = quotes.length;
  const filteredCount = filteredQuotes.length;
  
  let resultText = `Showing ${filteredCount} of ${totalQuotes} quotes`;
  
  if (currentFilters.category !== 'all') {
    resultText += ` in "${currentFilters.category}" category`;
  }
  
  if (currentFilters.search) {
    resultText += ` matching "${currentFilters.search}"`;
  }
  
  if (currentFilters.showFavorites) {
    resultText += ` (favorites only)`;
  }
  
  filterResults.textContent = resultText;
}

function updateCategoryCount() {
  const categoryQuotes = currentFilters.category === 'all' 
    ? quotes.length 
    : quotes.filter(q => q.category === currentFilters.category).length;
  
  categoryCount.textContent = `(${categoryQuotes})`;
}

function clearSearchFilter() {
  searchFilter.value = '';
  currentFilters.search = '';
  filterQuotes();
}

function resetAllFilters() {
  // Reset all filter controls
  categoryFilter.value = 'all';
  searchFilter.value = '';
  showFavorites.checked = false;
  sortOrder.value = 'random';
  
  // Reset filter state
  currentFilters = {
    category: 'all',
    search: '',
    showFavorites: false,
    sortOrder: 'random'
  };
  
  // Update category buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector('.category-btn').classList.add('active'); // First button (All)
  
  // Apply filters
  filterQuotes();
  
  // Save preferences
  saveFilterPreferences();
}

// ===== ENHANCED QUOTE DISPLAY =====

function displayFilteredQuotes() {
  // This function handles displaying quotes based on current filters
  // If there are filtered quotes, show the first one or a random one
  // This ensures the display updates immediately when filters change
  
  if (filteredQuotes.length === 0) {
    displayQuote("No quotes match your current filters.", "", null);
    return;
  }
  
  // Show the first quote from filtered results (or random based on sort order)
  let selectedQuote;
  if (currentFilters.sortOrder === 'random') {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    selectedQuote = filteredQuotes[randomIndex];
  } else {
    // For sorted lists, show the first quote
    selectedQuote = filteredQuotes[0];
    currentQuoteIndex = 0;
  }
  
  displayQuote(selectedQuote.text, selectedQuote.category, selectedQuote);
  
  // Save as last viewed quote
  saveLastQuote(selectedQuote);
}

function showRandomQuote() {
  if (filteredQuotes.length === 0) {
    displayQuote("No quotes match your current filters.", "", null);
    return;
  }
  
  // Get quote based on sort order
  let selectedQuote;
  if (currentFilters.sortOrder === 'random') {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    selectedQuote = filteredQuotes[randomIndex];
  } else {
    // For sorted lists, cycle through them
    selectedQuote = filteredQuotes[currentQuoteIndex];
    currentQuoteIndex = (currentQuoteIndex + 1) % filteredQuotes.length;
  }
  
  displayQuote(selectedQuote.text, selectedQuote.category, selectedQuote);
  
  // Save as last viewed quote
  saveLastQuote(selectedQuote);
  
  // Save user preferences
  saveUserPreferences();
}

function displayQuote(text, category, quoteObj) {
  // Clear existing content
  quoteDisplay.innerHTML = '';
  quoteDisplay.className = 'quote-display-enhanced';
  
  // Create quote container
  const quoteContainer = document.createElement('div');
  
  // Create quote actions (favorite, etc.)
  if (quoteObj) {
    const quoteActions = document.createElement('div');
    quoteActions.className = 'quote-actions';
    
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = `quote-action-btn quote-favorite ${quoteObj.favorite ? 'active' : ''}`;
    favoriteBtn.innerHTML = quoteObj.favorite ? '❤️' : '🤍';
    favoriteBtn.title = quoteObj.favorite ? 'Remove from favorites' : 'Add to favorites';
    favoriteBtn.onclick = () => toggleFavorite(quoteObj.id);
    
    quoteActions.appendChild(favoriteBtn);
    quoteContainer.appendChild(quoteActions);
  }
  
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

function toggleFavorite(quoteId) {
  const quote = quotes.find(q => q.id === quoteId);
  if (quote) {
    quote.favorite = !quote.favorite;
    saveQuotes();
    
    // Refresh display if showing the same quote
    const currentQuoteText = document.querySelector('.quote-text').textContent.slice(1, -1);
    if (currentQuoteText === quote.text) {
      displayQuote(quote.text, quote.category, quote);
    }
    
    // Reapply filters if favorites filter is active
    if (currentFilters.showFavorites) {
      filterQuotes();
    }
  }
}

// ===== WEB STORAGE FUNCTIONS =====

function loadQuotes() {
  try {
    const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (storedQuotes) {
      quotes = JSON.parse(storedQuotes);
      // Ensure all quotes have required properties
      quotes = quotes.map((quote, index) => ({
        text: quote.text,
        category: quote.category,
        id: quote.id || Date.now() + index,
        dateAdded: quote.dateAdded || new Date().toISOString().split('T')[0],
        favorite: quote.favorite || false
      }));
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

function loadFilterPreferences() {
  try {
    const storedFilters = localStorage.getItem(STORAGE_KEYS.FILTER_PREFERENCES);
    if (storedFilters) {
      const savedFilters = JSON.parse(storedFilters);
      currentFilters = { ...currentFilters, ...savedFilters };
      
      // Apply saved filters to UI
      if (categoryFilter) categoryFilter.value = currentFilters.category;
      if (searchFilter) searchFilter.value = currentFilters.search;
      if (showFavorites) showFavorites.checked = currentFilters.showFavorites;
      if (sortOrder) sortOrder.value = currentFilters.sortOrder;
    }
  } catch (error) {
    console.error('Error loading filter preferences:', error);
  }
}

function saveFilterPreferences() {
  try {
    localStorage.setItem(STORAGE_KEYS.FILTER_PREFERENCES, JSON.stringify(currentFilters));
  } catch (error) {
    console.error('Error saving filter preferences:', error);
  }
}

function saveLastQuote(quote) {
  try {
    const lastQuoteData = {
      quote: quote,
      timestamp: new Date().toISOString(),
      filters: currentFilters
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
      // Apply any session-specific preferences
    }
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
}

function saveUserPreferences() {
  try {
    const preferences = {
      lastFilters: currentFilters,
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
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
  
  // Create category input with suggestions
  const quoteCategoryInput = document.createElement('input');
  quoteCategoryInput.type = 'text';
  quoteCategoryInput.id = 'newQuoteCategory';
  quoteCategoryInput.placeholder = 'Enter quote category';
  quoteCategoryInput.required = true;
  
  // Add datalist for category suggestions
  const categoryDatalist = document.createElement('datalist');
  categoryDatalist.id = 'categoryOptions';
  const existingCategories = [...new Set(quotes.map(q => q.category))];
  existingCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    categoryDatalist.appendChild(option);
  });
  quoteCategoryInput.setAttribute('list', 'categoryOptions');
  
  // Create favorite checkbox
  const favoriteLabel = document.createElement('label');
  favoriteLabel.style.display = 'flex';
  favoriteLabel.style.alignItems = 'center';
  favoriteLabel.style.gap = '8px';
  favoriteLabel.style.margin = '10px 0';
  
  const favoriteCheckbox = document.createElement('input');
  favoriteCheckbox.type = 'checkbox';
  favoriteCheckbox.id = 'newQuoteFavorite';
  
  favoriteLabel.appendChild(favoriteCheckbox);
  favoriteLabel.appendChild(document.createTextNode('Mark as favorite'));
  
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
  addQuoteForm.appendChild(categoryDatalist);
  addQuoteForm.appendChild(favoriteLabel);
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
  const favoriteCheckbox = document.getElementById('newQuoteFavorite');
  const messageContainer = document.getElementById('messageContainer');
  
  const newQuoteText = quoteTextInput.value.trim();
  const newQuoteCategory = quoteCategoryInput.value.trim().toLowerCase();
  const isFavorite = favoriteCheckbox.checked;
  
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
    category: newQuoteCategory,
    id: Date.now(),
    dateAdded: new Date().toISOString().split('T')[0],
    favorite: isFavorite
  };
  
  quotes.push(newQuote);
  
  // Save to localStorage
  saveQuotes();
  
  // Update filtering system
  populateCategories();
  filterQuotes();
  
  // Clear form inputs
  quoteTextInput.value = '';
  quoteCategoryInput.value = '';
  favoriteCheckbox.checked = false;
  
  // Show success message
  showMessage(`Quote added successfully to "${newQuoteCategory}" category!`, 'success');
  
  // Display the new quote
  displayQuote(newQuote.text, newQuote.category, newQuote);
  
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
      version: "2.0",
      totalQuotes: quotes.length,
      categories: [...new Set(quotes.map(q => q.category))],
      filterPreferences: currentFilters
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
    
    showStorageMessage(`Successfully exported ${quotes.length} quotes with filtering preferences!`, 'success');
    
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
        
        // Import filter preferences if available
        if (importedData.filterPreferences) {
          currentFilters = { ...currentFilters, ...importedData.filterPreferences };
          saveFilterPreferences();
        }
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
              category: quote.category.trim().toLowerCase(),
              id: quote.id || Date.now() + index,
              dateAdded: quote.dateAdded || new Date().toISOString().split('T')[0],
              favorite: quote.favorite || false
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
      populateCategories();
      filterQuotes();
      
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
        displayQuote(randomImported.text, randomImported.category, randomImported);
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
  if (confirm('Are you sure you want to clear all data? This will remove all quotes and filter preferences and cannot be undone.')) {
    try {
      // Clear localStorage
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Reset to default quotes
      quotes = [...defaultQuotes];
      saveQuotes();
      
      // Reset filters
      currentFilters = {
        category: 'all',
        search: '',
        showFavorites: false,
        sortOrder: 'random'
      };
      
      // Reset UI
      populateCategories();
      resetAllFilters();
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
    const favorites = quotes.filter(q => q.favorite).length;
    
    storageStats.innerHTML = `
      <strong>Storage Statistics:</strong><br>
      Total Quotes: ${quotes.length} | 
      Categories: ${categories} | 
      Favorites: ${favorites} | 
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
    filterQuotes,
    populateCategories,
    filterByCategory,
    displayFilteredQuotes,
    quotes,
    filteredQuotes,
    currentFilters,
    selectedCategory
  };
  async function syncWithServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverQuotes = await response.json();

    // Simulate server sending quotes [{text, category}]
    // Conflict resolution: Server wins
    quotes = serverQuotes.map(p => ({ text: p.title, category: "Server" }));
    saveQuotes();
    populateCategories();
    showRandomQuote();

    alert("Quotes synced with server (server data took precedence).");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

// Simulate periodic sync
setInterval(syncWithServer, 60000); // every 1 min

}
// ==========================
// Dynamic Quote Generator
// ==========================

// ✅ Global State
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// Restore last selected filter
let lastFilter = localStorage.getItem("lastFilter") || "all";

// ✅ Utility: Save quotes to LocalStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ✅ Show Random Quote
function showRandomQuote() {
  let filteredQuotes = lastFilter === "all"
    ? quotes
    : quotes.filter(q => q.category === lastFilter);

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText =
      "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById("quoteDisplay").innerText =
    filteredQuotes[randomIndex].text;
}

// ✅ Add Quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category!");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  showRandomQuote();

  // Also push to server
  postQuoteToServer(newQuote);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  notifyUser("✅ Quote added successfully!");
}

// ✅ Populate Categories
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  filter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === lastFilter) option.selected = true;
    filter.appendChild(option);
  });
}

// ✅ Filter Quotes
function filterQuotes() {
  lastFilter = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", lastFilter);
  showRandomQuote();
}

// ✅ Export Quotes
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ✅ Import Quotes
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        notifyUser("✅ Quotes imported successfully!");
      } else {
        notifyUser("⚠️ Invalid JSON format", true);
      }
    } catch (err) {
      notifyUser("⚠️ Error reading file: " + err.message, true);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ==========================
// Stage 3: Server Sync + Conflict Resolution
// ==========================

// ✅ Fetch quotes from mock API
async function fetchQuotesFromServer() {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=5"
  );
  const data = await response.json();
  return data.map((post) => ({
    text: post.title,
    category: "Server",
  }));
}

// ✅ Post new quote to server (mocked)
async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote),
    });
    const data = await response.json();
    console.log("Posted to server:", data);
  } catch (error) {
    console.error("Post failed:", error);
  }
}

// ✅ Sync quotes (server takes precedence)
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Simple conflict resolution: server wins
    const localCount = quotes.length;
    quotes = serverQuotes;
    saveQuotes();
    populateCategories();
    showRandomQuote();

    notifyUser(
      `🔄 Synced with server. Local (${localCount}) replaced by Server (${serverQuotes.length}).`
    );
  } catch (error) {
    notifyUser("⚠️ Sync failed: " + error.message, true);
  }
}

// ✅ UI notifications
function notifyUser(message, isError = false) {
  let notif = document.getElementById("notifications");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "notifications";
    notif.style.padding = "10px";
    notif.style.margin = "10px 0";
    notif.style.borderRadius = "5px";
    notif.style.fontSize = "14px";
    document.body.prepend(notif);
  }
  notif.style.background = isError ? "#ffdddd" : "#ddffdd";
  notif.style.border = isError ? "1px solid red" : "1px solid green";
  notif.innerText = message;
}

// ✅ Periodic sync (every 1 min)
setInterval(syncQuotes, 60000);

// ==========================
// Initialization
// ==========================
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
document
  .getElementById("categoryFilter")
  .addEventListener("change", filterQuotes);
document.getElementById("exportBtn").addEventListener("click", exportQuotes);
document
  .getElementById("importFile")
  .addEventListener("change", importFromJsonFile);

populateCategories();
showRandomQuote();
// ✅ Sync quotes (server takes precedence)
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Simple conflict resolution: server wins
    const localCount = quotes.length;
    quotes = serverQuotes;
    saveQuotes();
    populateCategories();
    showRandomQuote();

    // Notify both detailed + simple message
    notifyUser("✅ Quotes synced with server!");
    console.log(`Local (${localCount}) replaced by Server (${serverQuotes.length}).`);
  } catch (error) {
    notifyUser("⚠️ Sync failed: " + error.message, true);
  }
}
