const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Middleware
app.use(cors({
    origin: ['http://26.164.148.120:8080', 'http://localhost:8080', 'https://illusivestore.netlify.app'],
    credentials: true
}));
app.use(express.json());

// Ваши реальные ключи СДЭК
const CDEK_CONFIG = {
    apiKey: 'IZXbP5gbWNq0TJQdXcdVTT3x3J349HGe', // ваш реальный ключ
    apiPassword: 'OatOZl0Zungypwe807b4pYxNmZgsgMrX', // ваш реальный пароль
    apiUrl: 'https://api.cdek.ru/v2'
};

// Прокси для авторизации
app.post('/api/cdek/auth', async (req, res) => {
    try {
        const response = await fetch(`${CDEK_CONFIG.apiUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'client_credentials',
                'client_id': CDEK_CONFIG.apiKey,
                'client_secret': CDEK_CONFIG.apiPassword
            })
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Прокси для поиска городов
app.get('/api/cdek/cities', async (req, res) => {
    try {
        const { city } = req.query;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        const response = await fetch(`${CDEK_CONFIG.apiUrl}/location/cities?city=${encodeURIComponent(city)}&size=20`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Прокси для ПВЗ
app.get('/api/cdek/pvz', async (req, res) => {
    try {
        const { city_code } = req.query;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        const response = await fetch(`${CDEK_CONFIG.apiUrl}/deliverypoints?city_code=${city_code}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Создание заказа в СДЭК
app.post('/api/cdek/order', async (req, res) => {
    try {
        const orderData = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        const response = await fetch(`${CDEK_CONFIG.apiUrl}/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Статика для фронтенда
app.use(express.static('.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});