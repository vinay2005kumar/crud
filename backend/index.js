require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { storage } = require('./cloudinary');
const employee = require('./model');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*',
    methods: "GET,POST,PUT,DELETE",
}));
app.use(express.json());

// Multer setup for Cloudinary
const upload = multer({ storage });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => console.log('DB connected'))
    .catch((err) => console.error('DB connection failed:', err));

// Routes
app.get('/employee', async (req, res) => {
    try {
        const result = await employee.find({});
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const newEmployee = new employee({
            ...req.body,
            file: req.file.path, // Cloudinary URL
        });
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload employee' });
    }
});

app.put('/employee/:id', upload.single('file'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.file = req.file.path; // Cloudinary URL
        }
        const updatedEmployee = await employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedEmployee);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

app.get('/employee/:id', async (req, res) => {
    try {
        const result = await employee.findById(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

app.delete('/employee/:id', async (req, res) => {
    try {
        const result = await employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee deleted', result });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
