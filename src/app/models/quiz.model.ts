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

interface IParticipatents{
    userId: { type: mongoose.Types.ObjectId , ref: 'User' },
    mark: { type : Number , default : 0 },
    duration : { type : TimeRanges , default : 0.00 },
    attempted : { type : Number , default : 0 }

}

// --- Participants Schema ---
const ParticipantsSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    mark: { 
        type: Number, 
        default: 0 
    },
    duration: { 
        type: Number, 
        default: 0.00 
    },
    attempted: { 
        type: Number, 
        default: 0 
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
    participatents: [ParticipantsSchema]

}, { timestamps: true });

export const Quiz= mongoose.model('Quiz', QuizSchema);