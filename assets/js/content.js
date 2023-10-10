// Define compose URL <to> will be replaces with a CSV list of e-mails
var composeURL = 'https://mail.google.com/mail/u/<accountNumber>/?view=cm&fs=1&tf=1&source=mailto&bcc=<to>';

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
        '<div class="batch-reply T-I T-I-ax7 batch-reply" role="button" tabindex="0" style="color: #ffffffc7; -webkit-user-select: none;">' +
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

        // Prepare URL
        var url = composeURL;

        // Insert <to> (list of csv e-mails)
        url = url.replace('<to>', emails);

        // Insert logged in account number
        url = url.replace('<accountNumber>', getLoggedInAccountNumber());

        // Open window
        window.open(url);
    }
}

function getLoggedInAccountNumber() {
    // Extract account number from page path
    var result = /mail\/u\/([0-9]+)\//g.exec(window.location.pathname);

    // All done
    return result[1];
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