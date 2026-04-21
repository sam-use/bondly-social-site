import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Attempting with explicit API version v1
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // The SDK might not have a direct listModels on genAI in all versions
    // Let's try to reach the endpoint directly using fetch if listModels isn't available
    console.log("Listing models via API endpoint...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (data.error) {
        console.error("API Error:", data.error.message);
        return;
    }

    console.log("Available Models (v1):");
    data.models.forEach(model => {
      console.log(`- ${model.name}`);
    });
  } catch (err) {
    console.error("Failed to list models:", err.message);
  }
}

listModels();
