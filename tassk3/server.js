const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve HTML directly in response
app.get('/', (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wikipedia Search</title>
    </head>
    <body>
        <h1>Search Wikipedia</h1>
        <input type="text" id="searchInput" placeholder="Enter a topic">
        <button id="searchButton">Search</button>
        <div id="result"></div>

        <script>
            document.getElementById('searchButton').addEventListener('click', function() {
                const query = document.getElementById('searchInput').value.trim();
                if (!query) {
                    document.getElementById('result').innerText = 'Please enter a search term.';
                    return;
                }
                fetch(\`/search?q=\${encodeURIComponent(query)}\`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('result').innerText = data.content;
                    })
                    .catch(error => {
                        document.getElementById('result').innerText = 'Failed to fetch data!';
                    });
            });
        </script>
    </body>
    </html>`;
    res.send(htmlContent);
});

// API endpoint for scraping Wikipedia
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).send('Search query is required.');
    }

    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const content = $('#mw-content-text .mw-parser-output > p').first().text().trim();
        
        if (!content) {
            res.send({ content: 'No content found for this search term.' });
        } else {
            res.send({ content });
        }
    } catch (error) {
        res.status(500).send({ content: 'Error fetching data. Please check your search term.' });
    }
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
