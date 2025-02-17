const Chat = require('../models/chat');
const axios = require('axios');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

module.exports.renderChat = async (req, res) => {
    try {
        const chat = await Chat.findOne({ user: req.user._id });
        res.render('chat/index', { messages: chat ? chat.messages : [] });
    } catch (error) {
        req.flash('error', 'Error loading chat history');
        res.redirect('/');
    }
};

module.exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        let chat = await Chat.findOne({ user: req.user._id });
        
        if (!chat) {
            chat = new Chat({ user: req.user._id, messages: [] });
        }

        // Add user message to chat history
        chat.messages.push({
            role: 'user',
            content: message
        });

        // Call Deepseek AI API
        const response = await axios.post(DEEPSEEK_API_URL, {
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant for a property rental platform called Neighborly. Help users with their queries about rentals, listings, and community features.'
                },
                {
                    role: 'user',
                    content: message
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Add AI response to chat history
        chat.messages.push({
            role: 'assistant',
            content: response.data.choices[0].message.content
        });

        await chat.save();
        res.json({ message: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Error processing your message' });
    }
}; 