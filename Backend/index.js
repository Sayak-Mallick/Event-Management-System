const express = require('express')

const app = express()

// Define a simple route
app.get('/', (req, res) => {
    res.send('Hello from your Node.js backend!')
})

const port = 5000

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})
