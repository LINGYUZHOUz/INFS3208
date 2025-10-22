const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
    const instanceId = process.env.INSTANCE_ID || 'Unknown';
    console.log(`[${instanceId}] ${req.method} ${req.path}`);
    next();
});

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/news', require('./routes/newRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api', require('./routes/cpuRoutes'));

app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.originalUrl 
    });
});

app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

if (require.main === module) {
    connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;