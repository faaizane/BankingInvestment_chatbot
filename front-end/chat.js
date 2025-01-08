// v6
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('user-input');
    const messages = document.getElementById('messages');
    const newChatButton = document.querySelector('.new-chat');
    const navSection = document.querySelector('.nav-section');

    let allChats = JSON.parse(localStorage.getItem('allChats')) || [];
    let currentChatIndex = allChats.length > 0 ? allChats.length - 1 : 0;
    let currentChat = allChats[currentChatIndex] || [];

    loadChatHistory();
    displayChat(currentChatIndex);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = input.value.trim();
        if (!userMessage) return;

        addMessage(userMessage, 'user');
        input.value = '';

        showTypingIndicator();

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage, user_id: 'default_user' })
            });
            const data = await response.json();
            removeTypingIndicator();
            addMessage(data.response, 'bot');
        } catch (error) {
            removeTypingIndicator();
            addMessage("Oops! Something went wrong. Please try again.", 'bot');
            console.error('Error:', error);
        }
    });

    newChatButton.addEventListener('click', () => {
        if (currentChat.length > 0) {
            allChats[currentChatIndex] = currentChat;
        }
        currentChat = [];
        currentChatIndex = allChats.length;
        allChats.push(currentChat);
        saveChatsToLocalStorage();
        messages.innerHTML = '';
        loadChatHistory();
    });


    function addMessage(content, type) {
        // Add message to the current chat history and save it
        currentChat.push({ content, type });
        saveChatsToLocalStorage();
    
        // Create the main message container
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
    
        // Create the avatar container and assign the appropriate SVG
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = type === 'bot'
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
                <path d="M2 14h2"/><path d="M20 14h2"/>
                <path d="M15 13v2"/><path d="M9 13v2"/>
                </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
                </svg>`;
    
        // Create the message content container
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
    
        // Append avatar and content based on message type
        if (type === 'user') {
            messageDiv.appendChild(messageContent); // User message: content first
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);         // Bot message: avatar first
            messageDiv.appendChild(messageContent);
        }
    
        // Append the message to the chat container and auto-scroll
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }
    


    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.innerHTML = `
        <div class="avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-bubble"></div>
                <div class="typing-bubble"></div>
                <div class="typing-bubble"></div>
            </div>
        </div>
    `;
        messages.appendChild(typingDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingMessage = messages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    function loadChatHistory() {
        navSection.innerHTML = ''; 
        allChats.forEach((chat, index) => {
            const firstMessage = chat[0]?.content || 'New Chat';
            const chatSummary = document.createElement('div');
            chatSummary.className = 'chat-summary';
    
            chatSummary.innerHTML = `
                <span>${firstMessage}</span>
                <button class="delete-chat" data-index="${index}" title="Delete Chat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"/>
                        <path d="M10 11v6"/>
                        <path d="M14 11v6"/>
                        <path d="M5 6l1-1h12l1 1"/>
                    </svg>
                </button>
            `;
    
            chatSummary.querySelector('span').addEventListener('click', () => displayChat(index));
            chatSummary.querySelector('.delete-chat').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteChat(index);
            });
    
            navSection.appendChild(chatSummary);
        });
    }
    
    function displayChat(index) {
        messages.innerHTML = ''; // Clear messages display before adding new ones
        currentChatIndex = index;
        currentChat = allChats[index] || [];
        currentChat.forEach(({ content, type }) => {
            createMessageElement(content, type);
        });
    }

    function createMessageElement(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';

        // Use icons instead of "B" and "U"
        avatar.innerHTML = type === 'bot' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';


        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;

        if (type === 'user') {
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
        }

        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    function deleteChat(index) {
        allChats.splice(index, 1);
        saveChatsToLocalStorage();
        loadChatHistory();

        // Update the current chat index if necessary
        if (currentChatIndex === index) {
            if (allChats.length > 0) {
                currentChatIndex = 0;
                displayChat(currentChatIndex);
            } else {
                messages.innerHTML = '';
            }
        } else if (currentChatIndex > index) {
            currentChatIndex--;
        }
    }

    function saveChatsToLocalStorage() {
        localStorage.setItem('allChats', JSON.stringify(allChats));
    }

    async function fetchChatHistoryFromMongoDB() {
        try {
            const response = await fetch('http://localhost:8000/chat_history?user_id=default_user');
            const history = await response.json();
            allChats = history.map(chat => chat.messages);
            currentChatIndex = allChats.length - 1;
            currentChat = allChats[currentChatIndex] || [];
            loadChatHistory();
            displayChat(currentChatIndex);
            saveChatsToLocalStorage();
        } catch (error) {
            console.error('Error fetching chat history from MongoDB:', error);
        }
    }

    window.addEventListener('beforeunload', () => {
        allChats[currentChatIndex] = currentChat;
        saveChatsToLocalStorage();
    });
});
