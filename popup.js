// Function to save message name and content to Chrome storage
function saveMessage() {
  var messageNameInput = document.getElementById('messageName');
  var messageContentInput = document.getElementById('messageContent');
  var messageName = messageNameInput.value;
  var messageContent = messageContentInput.value;
  var errorMessage = document.getElementById('errorMessage');

  // Check if either message name or content is empty
  if (messageName.trim() === '' || messageContent.trim() === '') {
    errorMessage.textContent = 'Please enter a valid message name and content.';
    return;
  }

  // Limit message name to 10 words
  var messageNameWords = messageName.trim().split(' ').slice(0, 10);
  messageName = messageNameWords.join(' ');

  // Clear the error message if there was one previously
  errorMessage.textContent = '';

  chrome.storage.sync.get('messages', function(data) {
    var messages = data.messages || [];

    var message = {
      name: messageName,
      content: messageContent
    };

    messages.push(message);

    chrome.storage.sync.set({ 'messages': messages }, function() {
      console.log('Message saved: ', message);
      retrieveMessageNames(); // Update the message buttons after saving

      // Clear the input fields
      messageNameInput.value = '';
      messageContentInput.value = '';
    });
  });
}


// Function to delete a message by name
function deleteMessage(name) {
  chrome.storage.sync.get('messages', function(data) {
    var messages = data.messages || [];
    var updatedMessages = messages.filter(function(message) {
      return message.name !== name;
    });

    chrome.storage.sync.set({ 'messages': updatedMessages }, function() {
      console.log('Message deleted: ', name);
      retrieveMessageNames(); // Update the message buttons after deleting
    });

    // Clear the search result
    var searchResult = document.getElementById('searchResult');
    searchResult.textContent = '';
  });
}


// Function to retrieve message names from Chrome storage
function retrieveMessageNames() {
  chrome.storage.sync.get('messages', function(data) {
    var messages = data.messages;

    if (messages && messages.length > 0) {
      var buttonContainer = document.getElementById('messageButtonContainer');
      buttonContainer.innerHTML = ''; // Clear previous buttons

      for (var i = 0; i < messages.length; i++) {
        var messageButton = document.createElement('button');
        messageButton.textContent = messages[i].name;

        // Create delete button
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add("delete-button")
        deleteButton.addEventListener('click', createDeleteClickHandler(messages[i].name)); // Pass the message name as a parameter

        // Create container div for message and delete buttons
        var container = document.createElement('div');
        container.classList.add('message-button-container');
        container.addEventListener('click', createMessageClickHandler(messages[i].content));

        container.appendChild(messageButton);
        container.appendChild(deleteButton);

        buttonContainer.appendChild(container);
      }
    } else {
      var messageButtonContainer = document.getElementById('messageButtonContainer');
      messageButtonContainer.textContent = 'No messages found in storage.';
    }
  });
}

// Function to create a delete click handler for each message button
function createDeleteClickHandler(name) {
  return function() {
    deleteMessage(name);
  };
}

// Function to create a click handler for each message button
function createMessageClickHandler(content) {
  return function() {
    var searchResult = document.getElementById('searchResult');
    searchResult.textContent = 'Message: ' + content;
    copyTextToClipboard(content);
  };
}

// Function to copy text to clipboard
function copyTextToClipboard(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// Function to search for a message by name
function searchMessage() {
  var searchName = document.getElementById('searchMessageName').value;

  chrome.storage.sync.get('messages', function(data) {
    var messages = data.messages;

    if (messages && messages.length > 0) {
      for (var i = 0; i < messages.length; i++) {
        if (messages[i].name === searchName) {
          document.getElementById('searchResult').textContent = 'Message: ' + messages[i].content;
          return; // Stop searching after finding the first matching message
        }
      }
      document.getElementById('searchResult').textContent = 'No message found with that name.';
    } else {
      document.getElementById('searchResult').textContent = 'No messages found in storage.';
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  retrieveMessageNames();

  var saveButton = document.getElementById('saveButton');
  saveButton.addEventListener('click', saveMessage);
});
