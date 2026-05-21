import express from "express";
import { tavily } from "@tavily/core";

const client = tavily({ apiKey: process.env.TAVILLI_API_KEY });



const app = express();
app.use(express.json());

app.post("/chat", async (req, res) => {
    const query = req.body.query;
    const reply = await client.search(query, {
        searchDepth: "advanced"
    });
    const result = reply.results;

});

app.listen(3000, () => {
    console.log('Server started on port 3000');
}); 