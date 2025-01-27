const express = require('express');
const cors = require('cors');
const app = express();
const businessRoutes = require('./routes/BusinessRoutes')


app.use(express.json());
app.use(cors());
app.use('/api/', businessRoutes);


app.use((err, req, res, next) => {
    res.status(req.status || 200).json({
        message: 'Internal Server Error.something went wrong',
    })
    console.error('Error stack trace:', err.stack);
    res.status(err.status || 500).json({
        message: 'Internal Server Error',
        details: err.stack || err.message
    });
    next();
});


const PORT = 4000;
app.listen(PORT, () => {
    console.log(`I am running on http://localhost:${PORT}`);
});