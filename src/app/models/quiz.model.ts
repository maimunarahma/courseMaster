import mongoose from 'mongoose';

// --- Embedded Question Schema ---
const QuestionSchema = new mongoose.Schema({
    // Unique ID for the question within the quiz (useful for front-end keys)
    id: { 
        type: String, 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    // Array of possible answers
    options: { 
        type: [String], 
        required: true 
    },
    // The specific correct answer value
    correctAnswer: { 
        type: String, 
        required: true 
    }
}, { _id: false });

// --- Main Quiz Schema ---
const QuizSchema = new mongoose.Schema({
    
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    
    // REFERENCE: The course the quiz belongs to (for easy aggregation/filtering)
    course: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    
    // EMBEDDING: The full question data is embedded here for a single, fast fetch
    questions: { 
        type: [QuestionSchema], 
        required: true 
    },
    
    // Minimum score (as a percentage) required to pass the quiz
    passingScore: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 100 
    },
    
    // Optional: Time limit for the assessment
    durationMinutes: { 
        type: Number, 
        default: 30 
    },

}, { timestamps: true });

export default mongoose.model('Quiz', QuizSchema);