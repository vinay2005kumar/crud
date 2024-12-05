const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const employee = require('./model');

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors({
    origin:'*', // Allow only this origin
    methods: "GET,POST,PUT,DELETE",
}));
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  });
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://vinaybuttala:223344Vinay@cluster0.qnujb1h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('DB connected'))
    .catch((err) => console.error('DB connection failed:', err));

// Multer Setup
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage });

// Routes
app.get('/employee', async (req, res) => {
    try {
        const result = await employee.find({});
        res.json(result);
        console.log('data',result)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const newEmployee = new employee({
            ...req.body,
            file: req.file.filename,
        });
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload employee' });
    }
});

app.put('/employee/:id', upload.single('file'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.file = req.file.filename;
        }
        const updatedEmployee = await employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedEmployee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

app.get('/employee/:id', async (req, res) => {
    try {
        const result = await employee.findById(req.params.id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

app.delete('/employee/:id', async (req, res) => {
    try {
        const result = await employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee deleted', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

// Start Server
app.listen(PORT, () => {
  console.log('Server running on http://localhost:10000');
});

