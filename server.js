const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

console.log("Initializing Express app...");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files from root

// Multer Setup for File Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'assets/uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const DATA_FILE = path.join(__dirname, 'data/properties.json');

// Helper to read data
function getProperties() {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
}

// Helper to save data
function saveProperties(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Endpoints

// GET All Properties
app.get('/api/properties', (req, res) => {
    try {
        const properties = getProperties();
        res.json(properties);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

// GET Single Property
app.get('/api/properties/:id', (req, res) => {
    try {
        const properties = getProperties();
        const property = properties.find(p => p.id === req.params.id);
        if (property) res.json(property);
        else res.status(404).json({ error: 'Property not found' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch property' });
    }
});

// POST Add Property
app.post('/api/properties', upload.array('images'), (req, res) => {
    try {
        const properties = getProperties();
        const newProperty = JSON.parse(req.body.data); // Data comes as stringified JSON

        // Handle images
        if (req.files && req.files.length > 0) {
            const imagePaths = req.files.map(f => 'assets/uploads/' + f.filename);
            newProperty.images = imagePaths;
        } else {
            newProperty.images = [];
        }

        // Generate ID if not present
        if (!newProperty.id) {
            newProperty.id = newProperty.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }

        properties.push(newProperty);
        saveProperties(properties);

        res.status(201).json(newProperty);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save property' });
    }
});

// DELETE Property
app.delete('/api/properties/:id', (req, res) => {
    try {
        let properties = getProperties();
        properties = properties.filter(p => p.id !== req.params.id);
        saveProperties(properties);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
