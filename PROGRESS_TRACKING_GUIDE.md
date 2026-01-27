# Video Progress Tracking System

## Overview
Track student video watch progress automatically. The system:
- ✅ Tracks how much of each video a student has watched
- ✅ Auto-marks lessons as completed when watched ≥ 80%
- ✅ Calculates overall course progress percentage
- ✅ Shows total videos vs watched videos

---

## API Endpoints

### 1. Track Video Progress
**Track when a student watches a video**

**Endpoint:** `POST /enroll/track-progress`

**Headers:**
- `Content-Type: application/json`
- Cookies: Authentication token

**Request Body:**
```json
{
  "courseId": "65f8a9b2c3d4e5f6a7b8c9d0",
  "lessonId": "65f8a9b2c3d4e5f6a7b8c9d1",
  "watchedDuration": 95
}
```

**Parameters:**
- `courseId` - MongoDB ObjectId of the course
- `lessonId` - MongoDB ObjectId of the lesson (from course.lessons array)
- `watchedDuration` - Number of seconds watched

**Response:**
```json
{
  "success": true,
  "message": "Video progress tracked successfully",
  "data": {
    "lessonCompleted": true,
    "overallProgress": 33,
    "completedLessons": 2,
    "totalLessons": 6,
    "watchedDuration": 95,
    "lessonDuration": 100
  }
}
```

**Logic:**
- Lesson marked complete if `watchedDuration >= lessonDuration * 0.8` (80%)
- Progress = `(completedLessons / totalLessons) * 100`

---

### 2. Get Student Progress
**Get complete progress summary for a course**

**Endpoint:** `GET /api/enroll/progress/:courseId`

**Headers:**
- Cookies: Authentication token

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "65f8a9b2c3d4e5f6a7b8c9d0",
    "totalVideos": 6,
    "watchedVideos": 2,
    "remainingVideos": 4,
    "progressPercentage": 33,
    "totalWatchTime": 450,
    "totalCourseDuration": 1200,
    "watchTimePercentage": 38,
    "lessonProgress": [
      {
        "lessonId": "65f8a9b2c3d4e5f6a7b8c9d1",
        "watchedDuration": 95,
        "isCompleted": true,
        "lastWatchedAt": "2026-01-27T10:30:00.000Z"
      },
      {
        "lessonId": "65f8a9b2c3d4e5f6a7b8c9d2",
        "watchedDuration": 355,
        "isCompleted": true,
        "lastWatchedAt": "2026-01-27T11:15:00.000Z"
      }
    ],
    "lastUpdated": "2026-01-27T11:15:00.000Z"
  }
}
```

**Fields Explained:**
- `totalVideos` - Total number of lessons in course
- `watchedVideos` - Number of completed lessons (≥80% watched)
- `progressPercentage` - Completion percentage based on lessons
- `totalWatchTime` - Total seconds watched across all lessons
- `totalCourseDuration` - Total duration of all lessons in seconds
- `watchTimePercentage` - Percentage of total course time watched

---

## Frontend Implementation

### React/Next.js Video Player Integration

```typescript
import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  courseId: string;
  lessonId: string;
  videoUrl: string;
}

export function VideoPlayer({ courseId, lessonId, videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Track progress every 5 seconds
    intervalRef.current = setInterval(async () => {
      const watchedDuration = Math.floor(video.currentTime);
      
      await fetch('/api/enroll/track-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          lessonId,
          watchedDuration
        })
      });
    }, 5000); // Update every 5 seconds

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [courseId, lessonId]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      width="100%"
    />
  );
}
```

### Progress Display Component

```typescript
import { useEffect, useState } from 'react';

interface ProgressData {
  totalVideos: number;
  watchedVideos: number;
  progressPercentage: number;
}

export function CourseProgress({ courseId }: { courseId: string }) {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      const res = await fetch(`/api/enroll/progress/${courseId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      setProgress(data.data);
    }
    
    fetchProgress();
  }, [courseId]);

  if (!progress) return <div>Loading...</div>;

  return (
    <div className="progress-card">
      <h3>Course Progress</h3>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress.progressPercentage}%` }}
        />
      </div>
      <p>{progress.progressPercentage}% Complete</p>
      <p>
        {progress.watchedVideos} / {progress.totalVideos} videos watched
      </p>
    </div>
  );
}
```

---

## Postman Testing

### Test 1: Track Video Progress

**Request:**
```
POST http://localhost:3000/api/enroll/track-progress
Content-Type: application/json

Body (raw JSON):
{
  "courseId": "YOUR_COURSE_ID",
  "lessonId": "YOUR_LESSON_ID",
  "watchedDuration": 85
}
```

**Get IDs:**
1. Get course ID from course list
2. Get lesson ID from course details - it's in `lessons[].id`

### Test 2: Get Progress

**Request:**
```
GET http://localhost:3000/api/enroll/progress/YOUR_COURSE_ID
```

---

## Database Schema

### Enrollment Model (Updated)

```typescript
{
  user: ObjectId,              // Reference to User
  course: ObjectId,            // Reference to Course
  
  // Array of completed lesson IDs
  lessonsCompleted: [ObjectId],
  
  // Detailed progress per lesson
  lessonProgress: [
    {
      lessonId: ObjectId,
      watchedDuration: Number,    // Seconds watched
      isCompleted: Boolean,       // Auto-set when ≥80%
      lastWatchedAt: Date
    }
  ],
  
  // Overall progress percentage (0-100)
  progress: Number,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Calculation Logic

### Lesson Completion
```javascript
const completionThreshold = lessonDuration * 0.8;
const isCompleted = watchedDuration >= completionThreshold;

// Example: 100 second video
// Completed if watched >= 80 seconds
```

### Overall Progress
```javascript
const progressPercentage = (completedLessons / totalLessons) * 100;

// Example: Completed 3 out of 10 lessons = 30%
```

### Watch Time Percentage
```javascript
const watchTimePercentage = (totalWatchTime / totalCourseDuration) * 100;

// Example: Watched 450 seconds of 1200 total = 38%
```

---

## Use Cases

### 1. Video Player Integration
Update progress every 5 seconds while video plays

### 2. Progress Dashboard
Show student how many videos completed vs total

### 3. Course Completion Certificate
Trigger when `progressPercentage === 100`

### 4. Resume Watching
Use `lastWatchedAt` to show "Continue watching"

### 5. Analytics
Track `watchTimePercentage` to see engagement

---

## Benefits

✅ **Automatic Tracking** - No manual marking needed
✅ **Real-time Progress** - Updates as student watches
✅ **Flexible Threshold** - 80% completion threshold (adjustable)
✅ **Detailed Analytics** - Per-lesson and overall stats
✅ **Resume Support** - Track last watched position
✅ **Accurate Metrics** - Duration-based calculation

---

## Example Flow

1. **Student enrolls** → Enrollment created with `progress: 0`
2. **Student watches video** → Frontend sends progress updates
3. **Watched 85/100 seconds** → Lesson marked complete (≥80%)
4. **Auto-calculation** → `progress = (1/6) * 100 = 17%`
5. **Get progress** → Display "17% complete, 1/6 videos"
6. **All videos watched** → `progress = 100%` → Certificate!

---

## Frontend Display Examples

### Progress Bar
```
Course Progress: 33%
████████░░░░░░░░░░░░░░  2 / 6 videos completed
```

### Video List
```
✅ Introduction (5:30)
✅ Setup Environment (8:15)  
⏸️ First Code (12:40) - Watched 3:20
⬜ Functions (10:20)
⬜ Objects (15:45)
⬜ Final Project (20:00)
```

---

## Tips

1. **Send updates every 5-10 seconds** - Don't spam the server
2. **Handle video seeking** - Update on seek events
3. **Offline support** - Queue updates when offline
4. **Debounce** - Prevent duplicate requests
5. **Error handling** - Retry failed progress updates
