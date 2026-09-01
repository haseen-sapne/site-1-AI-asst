import mongoose from 'mongoose';

const KnowledgeDocumentSchema = new mongoose.Schema({
    // The actual readable text (e.g., "A normal passport takes 30 days to process...")
    content: { type: String, required: true },

    embedding: {
        type: [Number],
        required: true,
        // Google's text-embedding-004 outputs 768 dimensions by default
        validate: {
            validator: (v: number[]) => v.length === 768,
            message: 'Embedding must be a 768-dimensional array'
        }
    },

    // Metadata for filtering searches
    metadata: {
        serviceType: { type: String, required: true }, // e.g., 'PASSPORT', 'CHALLAN'
        source: { type: String }, // e.g., 'FAQ_Page', 'Pricing_Table'
    }
});

export const KnowledgeDocument = mongoose.models.KnowledgeDocument || mongoose.model('KnowledgeDocument', KnowledgeDocumentSchema);