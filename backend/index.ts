const app = require('express');

app.post("/chat", (req, res) => {
    res.send("Hello server");
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});