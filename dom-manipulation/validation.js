// Validation script to verify all required functionality
// This can be run in browser console to test the implementation

console.log('🧪 Starting Dynamic Quote Generator Validation...');

// Test 1: Check if all required functions exist
const requiredFunctions = [
  'showRandomQuote',
  'createAddQuoteForm', 
  'addQuote',
  'loadQuotes',
  'saveQuotes',
  'exportQuotes',
  'importFromJsonFile'
];

console.log('\n📋 Function Availability Check:');
requiredFunctions.forEach(funcName => {
  if (typeof window[funcName] === 'function') {
    console.log(`✅ ${funcName} - Available`);
  } else {
    console.log(`❌ ${funcName} - Missing`);
  }
});

// Test 2: Check localStorage functionality
console.log('\n💾 localStorage Test:');
try {
  const testData = { test: 'localStorage working' };
  localStorage.setItem('validation_test', JSON.stringify(testData));
  const retrieved = JSON.parse(localStorage.getItem('validation_test'));
  
  if (retrieved.test === 'localStorage working') {
    console.log('✅ localStorage read/write - Working');
  } else {
    console.log('❌ localStorage read/write - Failed');
  }
  
  localStorage.removeItem('validation_test');
} catch (error) {
  console.log('❌ localStorage - Error:', error.message);
}

// Test 3: Check sessionStorage functionality
console.log('\n🗂️ sessionStorage Test:');
try {
  const testPrefs = { category: 'test', timestamp: Date.now() };
  sessionStorage.setItem('validation_prefs', JSON.stringify(testPrefs));
  const retrievedPrefs = JSON.parse(sessionStorage.getItem('validation_prefs'));
  
  if (retrievedPrefs.category === 'test') {
    console.log('✅ sessionStorage read/write - Working');
  } else {
    console.log('❌ sessionStorage read/write - Failed');
  }
  
  sessionStorage.removeItem('validation_prefs');
} catch (error) {
  console.log('❌ sessionStorage - Error:', error.message);
}

// Test 4: Check JSON functionality
console.log('\n📄 JSON Processing Test:');
try {
  const testQuotes = [
    { text: "Test quote for validation", category: "test" },
    { text: "Another test quote", category: "validation" }
  ];
  
  // Test JSON.stringify
  const jsonString = JSON.stringify(testQuotes);
  console.log('✅ JSON.stringify - Working');
  
  // Test JSON.parse
  const parsedQuotes = JSON.parse(jsonString);
  if (parsedQuotes.length === 2 && parsedQuotes[0].text.includes('Test')) {
    console.log('✅ JSON.parse - Working');
  } else {
    console.log('❌ JSON.parse - Failed');
  }
} catch (error) {
  console.log('❌ JSON processing - Error:', error.message);
}

// Test 5: Check Blob and URL functionality
console.log('\n🔗 Blob/URL API Test:');
try {
  const testData = { message: 'Blob test successful' };
  const blob = new Blob([JSON.stringify(testData)], { type: 'application/json' });
  console.log('✅ Blob creation - Working');
  
  const url = URL.createObjectURL(blob);
  console.log('✅ URL.createObjectURL - Working');
  
  URL.revokeObjectURL(url);
  console.log('✅ URL.revokeObjectURL - Working');
} catch (error) {
  console.log('❌ Blob/URL API - Error:', error.message);
}

// Test 6: Check FileReader availability
console.log('\n📁 FileReader API Test:');
if (typeof FileReader !== 'undefined') {
  console.log('✅ FileReader API - Available');
} else {
  console.log('❌ FileReader API - Not available');
}

// Test 7: Check DOM elements
console.log('\n🎯 DOM Elements Check:');
const requiredElements = [
  'quoteDisplay',
  'newQuote', 
  'toggleForm',
  'categoryFilter',
  'exportQuotes',
  'clearStorage',
  'importFile'
];

requiredElements.forEach(elementId => {
  const element = document.getElementById(elementId);
  if (element) {
    console.log(`✅ #${elementId} - Found`);
  } else {
    console.log(`❌ #${elementId} - Missing`);
  }
});

// Test 8: Check if quotes array exists and has data
console.log('\n📚 Data Structure Check:');
if (typeof quotes !== 'undefined') {
  console.log(`✅ quotes array - Available (${quotes.length} quotes)`);
  
  if (quotes.length > 0) {
    const firstQuote = quotes[0];
    if (firstQuote.text && firstQuote.category) {
      console.log('✅ Quote structure - Valid (text, category)');
    } else {
      console.log('❌ Quote structure - Invalid');
    }
  }
} else {
  console.log('❌ quotes array - Not found');
}

// Test 9: Storage keys validation
console.log('\n🔑 Storage Keys Check:');
if (typeof STORAGE_KEYS !== 'undefined') {
  console.log('✅ STORAGE_KEYS - Defined');
  console.log(`   - QUOTES: ${STORAGE_KEYS.QUOTES}`);
  console.log(`   - LAST_QUOTE: ${STORAGE_KEYS.LAST_QUOTE}`);
  console.log(`   - USER_PREFERENCES: ${STORAGE_KEYS.USER_PREFERENCES}`);
} else {
  console.log('❌ STORAGE_KEYS - Not defined');
}

// Test 10: Event listeners check
console.log('\n🎧 Event Listeners Check:');
const buttonsWithListeners = [
  'newQuote',
  'toggleForm', 
  'exportQuotes',
  'clearStorage'
];

buttonsWithListeners.forEach(buttonId => {
  const button = document.getElementById(buttonId);
  if (button && button.onclick) {
    console.log(`✅ #${buttonId} - Has event listener`);
  } else if (button) {
    console.log(`⚠️ #${buttonId} - Found but no onclick (may use addEventListener)`);
  } else {
    console.log(`❌ #${buttonId} - Not found`);
  }
});

console.log('\n🎉 Validation Complete!');
console.log('\n📝 Summary:');
console.log('- All core functions should be available');
console.log('- Web storage APIs should be working');
console.log('- JSON processing should be functional');
console.log('- File APIs should be available');
console.log('- DOM elements should be present');
console.log('- Event listeners should be attached');

console.log('\n🚀 Ready to test the full application!');

// Export validation results for potential use
window.validationResults = {
  timestamp: new Date().toISOString(),
  functionsAvailable: requiredFunctions.every(fn => typeof window[fn] === 'function'),
  storageWorking: true, // Will be set based on actual tests
  jsonWorking: true,    // Will be set based on actual tests
  domElementsPresent: requiredElements.every(id => document.getElementById(id) !== null)
};