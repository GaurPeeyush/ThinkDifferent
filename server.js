const express = require("express");
const axios = require("axios");
const PptxGenJS = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const GPT_API_KEY = "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";

async function generatePresentationContent(topic) {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/engines/davinci/completions",
            {
                prompt: `Generate a summarized presentation content about "${topic}".`,
                max_tokens: 200,
                n: 1,
                stop: null,
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GPT_API_KEY}`,
                },
            }
        );

        if (response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].text.trim();
        } else {
            throw new Error("No content generated.");
        }
    } catch (error) {
        console.error("Error generating presentation content:", error.response ? error.response.data : error);
        throw new Error("Failed to generate presentation content.");
    }
}

async function generatePresentation(topic, content) {
    try {
        const pptx = new PptxGenJS();

        // Set presentation properties
        pptx.author = "AI-Powered One-Click Presentation Builder";
        pptx.company = "Your Company";
        pptx.title = topic;

        // Create a title slide
        const titleSlide = pptx.addSlide();
        titleSlide.addText(topic, { x: 0.5, y: 1.5, w: "90%", h: 1.5, fontSize: 28, bold: true, align: "center" });

        // Split the content into bullet points
        const bulletPoints = content.split("\n");

        // Create a content slide for each bullet point
        bulletPoints.forEach((bulletPoint, index) => {
            const contentSlide = pptx.addSlide();
            contentSlide.addText(
                [{ text: bulletPoint, options: { bullet: { code: "2022" }, fontSize: 18, indentLevel: 0 } }],
                { x: 0.5, y: 1.0, w: "90%", h: 5.5 }
            );
        });

        // Save the presentation to a temporary file
        const outputPath = path.join(__dirname, "public", "temp", `${Date.now()}_${topic}.pptx`);
        await pptx.writeFile(outputPath);
        return outputPath;
    } catch (error) {
        console.error("Error generating presentation:", error);
        throw new Error("Failed to generate presentation.");
    }
}

app.post("/generate", async (req, res) => {
    const topic = req.body.topic;
    if (!topic) {
        return res.status(400).send("No topic provided.");
    }

    try {
        const presentationContent = await generatePresentationContent(topic);
        const presentationFile = await generatePresentation(topic, presentationContent);
        const fileName = path.basename(presentationFile);
        res.status(200).send({ file: `/temp/${fileName}` });
    } catch (error) {
        console.error("Error in /generate route:", error);
        res.status(500).send("Error generating presentation.");
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
