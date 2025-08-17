// Validation script to check filtering logic in script.js
// Run this in browser console after loading the main application

console.log('🔍 Validating Category Filtering Logic...');

// Check 1: selectedCategory variable
console.log('\n📋 Variable Checks:');
if (typeof selectedCategory !== 'undefined') {
  console.log(`✅ selectedCategory variable exists: "${selectedCategory}"`);
} else {
  console.log('❌ selectedCategory variable is missing');
}

if (typeof currentFilters !== 'undefined') {
  console.log(`✅ currentFilters object exists:`, currentFilters);
} else {
  console.log('❌ currentFilters object is missing');
}

if (typeof filteredQuotes !== 'undefined') {
  console.log(`✅ filteredQuotes array exists with ${filteredQuotes.length} quotes`);
} else {
  console.log('❌ filteredQuotes array is missing');
}

// Check 2: Required functions
console.log('\n🔧 Function Checks:');
const requiredFunctions = [
  'filterQuotes',
  'filterByCategory', 
  'displayFilteredQuotes',
  'populateCategories',
  'selectCategoryButton'
];

requiredFunctions.forEach(funcName => {
  if (typeof window[funcName] === 'function') {
    console.log(`✅ ${funcName}() function exists`);
  } else {
    console.log(`❌ ${funcName}() function is missing`);
  }
});

// Check 3: DOM elements
console.log('\n🎯 DOM Element Checks:');
const requiredElements = [
  'categoryFilter',
  'categoryButtons',
  'searchFilter',
  'showFavorites',
  'sortOrder'
];

requiredElements.forEach(elementId => {
  const element = document.getElementById(elementId);
  if (element) {
    console.log(`✅ #${elementId} element exists`);
  } else {
    console.log(`❌ #${elementId} element is missing`);
  }
});

// Check 4: Test filtering functionality
console.log('\n🧪 Functionality Tests:');

try {
  // Test category filtering
  const originalCategory = selectedCategory;
  const testCategories = ['motivation', 'innovation', 'all'];
  
  testCategories.forEach(category => {
    if (typeof filterByCategory === 'function') {
      filterByCategory(category);
      if (selectedCategory === category) {
        console.log(`✅ filterByCategory("${category}") works correctly`);
      } else {
        console.log(`❌ filterByCategory("${category}") failed - selectedCategory is "${selectedCategory}"`);
      }
    }
  });
  
  // Restore original category
  if (typeof filterByCategory === 'function') {
    filterByCategory(originalCategory);
  }
  
} catch (error) {
  console.log(`❌ Error testing filtering functionality: ${error.message}`);
}

// Check 5: Event handlers
console.log('\n🎧 Event Handler Checks:');

const categoryFilterElement = document.getElementById('categoryFilter');
if (categoryFilterElement) {
  if (categoryFilterElement.onchange) {
    console.log('✅ categoryFilter has onchange event handler');
  } else {
    console.log('❌ categoryFilter missing onchange event handler');
  }
} else {
  console.log('❌ categoryFilter element not found');
}

// Check 6: Storage integration
console.log('\n💾 Storage Integration Checks:');

try {
  const filterPrefs = localStorage.getItem('quoteGenerator_filterPreferences');
  if (filterPrefs) {
    const parsed = JSON.parse(filterPrefs);
    console.log('✅ Filter preferences found in localStorage:', parsed);
  } else {
    console.log('⚠️ No filter preferences in localStorage (this is OK for first run)');
  }
} catch (error) {
  console.log(`❌ Error checking localStorage: ${error.message}`);
}

// Check 7: Test actual filtering
console.log('\n🔍 Live Filtering Test:');

if (typeof quotes !== 'undefined' && quotes.length > 0) {
  const categories = [...new Set(quotes.map(q => q.category))];
  console.log(`Available categories: ${categories.join(', ')}`);
  
  categories.forEach(category => {
    const filtered = quotes.filter(q => q.category === category);
    console.log(`Category "${category}": ${filtered.length} quotes`);
  });
  
  // Test the actual filtering function
  if (typeof filterQuotes === 'function') {
    const originalFiltered = filteredQuotes.length;
    filterQuotes();
    console.log(`✅ filterQuotes() executed successfully. Results: ${filteredQuotes.length} quotes`);
  }
} else {
  console.log('❌ No quotes available for testing');
}

// Summary
console.log('\n📊 Validation Summary:');
console.log('If you see ❌ errors above, those indicate missing functionality.');
console.log('If you see ✅ checkmarks, those features are working correctly.');
console.log('\n🚀 To test manually:');
console.log('1. Use the category dropdown to select different categories');
console.log('2. Check that selectedCategory variable updates: console.log(selectedCategory)');
console.log('3. Check that filteredQuotes updates: console.log(filteredQuotes.length)');
console.log('4. Verify the displayed quote changes to match the selected category');

// Export validation results
window.filteringValidation = {
  selectedCategoryExists: typeof selectedCategory !== 'undefined',
  filterFunctionsExist: typeof filterQuotes === 'function' && typeof filterByCategory === 'function',
  domElementsExist: !!document.getElementById('categoryFilter'),
  timestamp: new Date().toISOString()
};