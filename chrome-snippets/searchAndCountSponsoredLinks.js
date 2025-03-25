const maxTabs = 2; // Limit number of tabs to open at once
let currentTabIndex = 0; // Keeps track of the current tab being processed
let openTabs = [];
let queriesArray = [];
let isBlockedByCaptcha = false;
let results = [];

// Function to open a new tab, perform a search, and count sponsored links
function openSearchAndCountSponsoredLinks(query) {
  // Open a new tab with the Google search query
  let searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
  let newTab = window.open(searchUrl, '_blank');

  // Monitor when the tab has finished loading and execute the sponsored link counting
  const interval = setInterval(function() {
    try {
            // If the tab is fully loaded, process the sponsored links
    if (newTab.document.readyState === 'complete') {
        clearInterval(interval); // Stop checking the tab once it's fully loaded
  
        if (isBlockedByCaptcha || detectRecaptchaV2(newTab)) {
          return;
        }
  
        // Count the sponsored links
        let sponsoredSpans = newTab.document.querySelectorAll('span');
        let sponsoredLinks = Array.from(sponsoredSpans).filter(span => span.innerText.includes('Sponsored'));
  
        // Output the number of sponsored links for the current query
        console.log(`Number of sponsored links for query "${query}":`, sponsoredLinks.length);
        results.push(
          {
            query: query,
            sponsoredLinksDetected: sponsoredLinks.length,
            hasFacedRecaptcha: detectRecaptcha(newTab),
          }
        );
  
        // Close the tab after processing
        newTab.close();
  
        // Move to the next tab processing if there are still queries left
        currentTabIndex++;
  
        // Open the next set of tabs if needed
        if (currentTabIndex < queriesArray.length) {
          if (openTabs.length < maxTabs) {
            openSearchAndCountSponsoredLinks(queriesArray[currentTabIndex]);
          }
        } else if (currentTabIndex > queriesArray.length) {
          // Output the array
          console.log('Done!', searchQueriesArray);
        }
      }
    } catch (e) {
        console.error(e);
        clearInterval(interval);
    }

  }, 500); // Check every 500ms if the tab is loaded
}

// Function to manage the opening of tabs in batches
function startBatchProcessing() {
  // Open the first batch of tabs (up to maxTabs)
  for (let i = 0; i < maxTabs && currentTabIndex < queriesArray.length; i++) {
    openSearchAndCountSponsoredLinks(queriesArray[currentTabIndex]);
    currentTabIndex++;
  }
}

function convertToArray(inputString) {
  // Split the input string by newlines and return the result as an array
  return inputString.split('\n').map(item => item.trim()).filter(item => item !== '');
}

function smartSearchAndCount(queries) {
  queriesArray = convertToArray(queries);
  startBatchProcessing();
}

function detectRecaptchaV2(tab) {
  console.log("Has recaptcha :", tab.document.querySelectorAll('.g-recaptcha').length > 0);
  return tab.document.querySelectorAll('.g-recaptcha').length > 0;
}


// Function to convert user input into an array of search queries
function getSearchQueriesFromUser() {
  // Ask the user to input search queries, separated by newlines
  let userInput = prompt('Enter your search queries, each on a new line:\n(Press Cancel when done)');
  let iAmBlockedByCaptcha = prompt('Are you blocked by recaptcha my baby ? (y/n)');
  
  // Check if the user has input any data
  if (userInput) {
    // check if you are blocked by recaptcha, if yes then it will open a search aand let you do the recaptcha
    if (iAmBlockedByCaptcha) {
      isBlockedByCaptcha = (iAmBlockedByCaptcha.toLowerCase() === 'y' || iAmBlockedByCaptcha.toLowerCase() === 'yes');
    }
  
    // Split the input string by newlines and return the result as an array
    smartSearchAndCount(userInput);
   
    return results;
  } else {
    return [];
  }
}

// Call the function to get the array of search queries
let searchQueriesArray = getSearchQueriesFromUser();
