const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
async function initDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ initialBalance: 0 }));
  }
}

// Get current initial balance
app.get('/initial-balance', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read initial balance' });
  }
});

// Reset profit tracking point
app.post('/reset-profit', async (req, res) => {
  try {
    const { balance } = req.body;
    await fs.writeFile(DATA_FILE, JSON.stringify({ initialBalance: balance }));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset profit tracking point' });
  }
});

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

initDataFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 