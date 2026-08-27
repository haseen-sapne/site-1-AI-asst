import { embed } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { KnowledgeDocument } from '../lib/models'; // Adjust path if needed

dotenv.config({ path: '.env.local' });

// Initialize the Google provider for the Vercel AI SDK
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// The raw knowledge we want to insert
const passportKnowledgeChunks = [
    {
        text: "A standard 36-page fresh passport application costs ₹1,500. A Tatkaal application costs ₹3,500. Payment must be made online.",
        metadata: { serviceType: "PASSPORT", source: "Pricing_Rules" }
    },
    {
        text: "To apply for a passport, citizens must provide proof of address, proof of date of birth, and identity proof. Acceptable identity proofs include Voter ID or PAN Card.",
        metadata: { serviceType: "PASSPORT", source: "Document_Checklist" }
    },
    {
        text: "Normal passport processing takes 15 to 30 days. Tatkaal processing takes 1 to 3 days. Police verification is required for both.",
        metadata: { serviceType: "PASSPORT", source: "Timeline_Rules" }
    }
];

async function runIngestion() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB Site 1');

    for (const chunk of passportKnowledgeChunks) {
        console.log(`🧠 Vectorizing chunk: "${chunk.text.substring(0, 30)}..."`);

        // Generate the vector using Vercel AI SDK and Gemini
        // Generate the vector using Vercel AI SDK and the new Gemini model
        const { embedding } = await embed({
            model: google.textEmbeddingModel('gemini-embedding-001'),
            value: chunk.text,
            providerOptions: {
                google: {
                    outputDimensionality: 768,
                }
            }
        });
        // Save the text, the vector, and the metadata to MongoDB
        await KnowledgeDocument.create({
            content: chunk.text,
            embedding: embedding,
            metadata: chunk.metadata
        });

        console.log('✅ Saved to Vector DB');
    }

    console.log('🎉 Ingestion complete!');
    process.exit(0);
}

runIngestion();