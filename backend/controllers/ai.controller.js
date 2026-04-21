import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const resolveModel = () => {
    const preferredModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    for (const modelId of preferredModels) {
        try {
            return genAI.getGenerativeModel({ model: modelId });
        } catch (error) {
            console.error(`Failed to initialize model ${modelId}:`, error.message);
        }
    }
    throw new Error("Unable to initialize any Gemini model");
};

export const generateCaption = async (req, res) => {
    try {
        const image = req.file;
        if (!image) {
            return res.status(400).json({ message: "Image is required", success: false });
        }

        console.log("AI Generation Request - File:", !!image);
        
        // Attempt generation with fallback models to avoid 404 Not Found errors
        let result;
        let success = false;
        let lastError;

        const modelIds = [
            "gemini-2.5-flash", 
            "gemini-2.0-flash", 
            "gemini-2.5-pro",
            "gemini-1.5-flash", // Keeping as absolute fallback
            "gemini-pro-vision"
        ];

        for (const modelId of modelIds) {
            try {
                console.log(`Trying Gemini Model: ${modelId}...`);
                const model = genAI.getGenerativeModel({ model: modelId });
                
                // Convert buffer to base64
                const imageData = {
                    inlineData: {
                        data: image.buffer.toString("base64"),
                        mimeType: image.mimetype,
                    },
                };

                const prompt = `Analyze this image and generate:
                1. Three distinct captions in these tones: Funny, Professional, and Aesthetic.
                2. A list of 5-10 relevant hashtags.
                
                Respond ONLY with a JSON object in this exact format:
                {
                  "captions": {
                    "funny": "caption text here",
                    "professional": "caption text here",
                    "aesthetic": "caption text here"
                  },
                  "hashtags": ["#tag1", "#tag2", "..."]
                }`;

                result = await model.generateContent([prompt, imageData]);
                success = true;
                break; // Exit loop if successful
            } catch (err) {
                console.error(`Error with model ${modelId}:`, err.message);
                lastError = err;
                if (err.status !== 404) break; // If it's not a 404, might be a larger issue
            }
        }

        if (!success) {
            throw lastError || new Error("All AI models failed");
        }

        const response = await result.response;
        const text = response.text();
        console.log("Gemini Response Text:", text);
        
        // Clean the response text in case Gemini adds markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Failed to find JSON in AI response:", text);
            throw new Error("Failed to parse AI response as JSON");
        }
        
        const aiData = JSON.parse(jsonMatch[0]);

        return res.status(200).json({
            success: true,
            ...aiData
        });

    } catch (error) {
        console.error("AI Generation Error Details:", error);
        return res.status(500).json({
            message: "Failed to generate AI captions",
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const generateChatReply = async (req, res) => {
    try {
        const { mode, draft, conversation = [], recipientName } = req.body;

        if (!mode) {
            return res.status(400).json({ success: false, message: "Mode is required" });
        }

        if (mode === "grammar" && !draft?.trim()) {
            return res.status(400).json({ success: false, message: "Draft text is required for grammar fix" });
        }

        const recentConversation = Array.isArray(conversation) ? conversation.slice(-8) : [];
        const conversationText = recentConversation
            .map((msg, index) => {
                const sender = msg?.isOwn ? "Me" : (recipientName || "Them");
                const text = msg?.text || msg?.message || "";
                return `${index + 1}. ${sender}: ${text}`;
            })
            .join("\n");

        const instructionMap = {
            flirty: "Write one flirty but respectful reply.",
            funny: "Write one funny, light-hearted reply.",
            polite: "Write one polite and warm reply.",
            continue: "Continue the conversation naturally with one concise message.",
            grammar: "Fix grammar and clarity of the draft while keeping original meaning."
        };

        if (!instructionMap[mode]) {
            return res.status(400).json({ success: false, message: "Invalid mode provided" });
        }

        const prompt = `
You are an AI chat assistant for a social messaging app.
Return only the final reply text with no quotes, labels, markdown, or explanation.

Mode: ${mode}
Task: ${instructionMap[mode]}
Recipient: ${recipientName || "Friend"}

Recent conversation:
${conversationText || "No previous messages."}

${mode === "grammar" ? `Draft to fix:\n${draft}` : ""}
`;

        const model = resolveModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const suggestion = response.text()?.trim();

        if (!suggestion) {
            return res.status(500).json({ success: false, message: "AI returned an empty response" });
        }

        return res.status(200).json({
            success: true,
            suggestion
        });
    } catch (error) {
        console.error("AI chat reply generation failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate AI reply"
        });
    }
};
