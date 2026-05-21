import "dotenv/config";
import express from "express";
import cors from "cors";
import { tavily } from "@tavily/core";
import { SYSTEM_PROMPT } from "./prompt";
import { Agent, run } from "@openai/agents";

const client = tavily({ apiKey: process.env.TAVILLI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

app.post("/chat", async (req, res) => {
    const query = req.body.query;
    try {
        // Get web search results
        const reply = await client.search(query, { searchDepth: "advanced" });
        const results = reply.results ?? [];
        const context = results
            .map(
                (item, index) => `\n[${index + 1}]\nTitle: ${item.title}\nContent: ${item.content}\nURL: ${item.url}`
            )
            .join("\n");

        // Create LLM agent with system prompt
        const agent = new Agent({
            name: "webAI",
            instructions: SYSTEM_PROMPT,
        });
        const prompt = `USER_QUESTION:${query}\nCONTEXT:${context}\nUse the web search results above to answer the user accurately.`;
        const result = await run(agent, prompt);
        const answer = result.finalOutput;
        console.log(answer);
        res.json({ result: answer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
}); 