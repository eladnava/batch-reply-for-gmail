// Limit listeners to https://mail.google.com/mail
var filter = {
    'url': [
        {
            hostSuffix: 'google.com'
        }
    ]
};

// Define injection function
function inject(tab) {
    // Communicate with content script and ask for re-injection
    chrome.tabs.sendMessage(tab.tabId, { inject: true });
}

// DOM changed listener
chrome.webNavigation.onDOMContentLoaded.addListener(
    function (tab) {
        // Re-inject button
        inject(tab);
    },
    filter
);

// Navigation complete listener
chrome.webNavigation.onCompleted.addListener(
    function (tab) {
        // Re-inject
        inject(tab);
    },
    filter
);