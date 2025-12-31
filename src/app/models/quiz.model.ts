import mongoose from 'mongoose';

// --- Embedded Question Schema ---
const QuestionSchema = new mongoose.Schema({
    // Unique ID for the question within the quiz (useful for front-end keys)
  
    question: { 
        type: String, 
        // required: true 
    },
    // Array of possible answers
    options: { 
        type: Map, 
        of: String,
        required: true 
    },
    // The specific correct answer value
    correctAnswer: { 
        type: String, 
        required: true 
    }
});

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
    
    // Optional: Time limit for the assessment
    durationMinutes: { 
        type: Number, 
        default: 30 
    },

}, { timestamps: true });

export const Quiz= mongoose.model('Quiz', QuizSchema);