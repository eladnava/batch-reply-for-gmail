// Define compose URL <to> will be replaces with a CSV list of e-mails
var composeURL = 'https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&source=mailto&bcc=<to>';

// Batch reply button
function getBatchReplyButton() {
    return $("div[gh='mtb'] .batch-reply");
}

// Get checked conversations
function getCheckedConversations() {
    return $("div[aria-checked='true']");
}

// Get conversation e-mails
function getConversationEmails(message) {
    return message.parents('tr').find("span[email]");
}

// Conversations list view
function getConversationsListView() {
    return $(".UI[gh='tl']");
}

// Conversations menu cont.
function getMenuContainer() {
    return $("div[gh='mtb']").children(":first").children(":first");
}

// Batch reply button HTML
function getBatchReplyButtonHTML() {
    return '<div class="J-J5-Ji">' +
        '<div class="batch-reply T-I T-I-ax7 batch-reply" role="button" tabindex="0" style="-webkit-user-select: none;">' +
        'Reply' +
        '</div>' +
        '</div>';
}

// Inject batch-reply button (called multiple times)
function refreshBatchReplyButton() {
    // Get batch reply button if already injected
    var batchReply = getBatchReplyButton();

    // Get conversations view to check if visible
    var conversationsView = getConversationsListView();

    // Not injected?
    if (!batchReply.length) {
        // Conversations view visible?
        if (conversationsView.length) {
            // Get menu container (options above list)
            var menuContainer = getMenuContainer();

            // Inject batch reply button
            menuContainer.append(getBatchReplyButtonHTML());

            // Handle batch-reply click
            getBatchReplyButton().click(function () {
                // Call batch reply function
                prepareBatchReply();
            });
        }
    }

    // Not in message list?
    if (!conversationsView.length) {
        // Hide batch reply
        batchReply.parent().hide();
    }
    else {
        // Show batch reply
        batchReply.parent().show();
    }
}

function prepareBatchReply() {
    // Prepare unique emails array
    var emails = [];

    // Loop over checked items
    getCheckedConversations().each(function () {
        // Get checked item
        var conversation = $(this);

        // Get all e-mails related to this conversation
        getConversationEmails(conversation).each(function () {
            // Get email
            var email = $(this);

            // Is it my e-mail?
            if (email.attr('name') == 'me') {
                // Skip it
                return;
            }

            // Get e-mail address
            var email = email.attr('email');

            // Not already added?
            if (emails.indexOf(email) == -1) {
                // Add it to emails array
                emails.push(email);
            }
        });
    });

    // Got anything?
    if (emails.length > 0) {
        // Convert to string and URL-encode
        emails = encodeURIComponent(emails.join(', '));

        // Open it in a new window (replace <to> with emails)
        window.open(composeURL.replace('<to>', emails));
    }
}

// Listen for events from the background script
chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        // Injection requested?
        if (request.inject) {
            // Refresh button
            refreshBatchReplyButton();
        }
    }
);

// Handle HTML5 page change
window.onpopstate = history.onpushstate = function (e) {
    // Refresh button
    refreshBatchReplyButton();
}