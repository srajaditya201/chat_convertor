const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/convert', (req, res) => {
    const { text, format } = req.body;

    // Make API request to ChatGPT API
    axios.post('https://api.openai.com/v1/files', {
        purpose: `Convert text to ${format}`,
        data: text,
        file_extension: format,
        model: 'text-davinci-002'
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY_HERE'
        }
    })
    .then(response => {
        // Save the converted file to local disk
        const fileName = `output.${format}`;
        const filePath = `./public/${fileName}`;
        fs.writeFile(filePath, response.data, err => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                // Send the file as a download
                res.download(filePath, fileName, err => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        // Delete the file from local disk
                        fs.unlinkSync(filePath);
                    }
                });
            }
        });
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Internal Server Error');
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});