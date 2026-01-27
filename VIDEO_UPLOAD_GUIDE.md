# Video Upload to Cloudinary - Implementation Guide

## Setup

### 1. Environment Variables
Add these to your `.env` file:
```env
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

### 2. Create uploads folder
Create a temporary folder for file uploads:
```bash
mkdir uploads
```

Add to `.gitignore`:
```
uploads/
```

## Usage

### Option 1: Upload Video First, Then Add to Lesson (Recommended)

#### Step 1: Upload Video to Cloudinary
**Endpoint:** `POST /api/upload/video`

**Form Data:**
- Field name: `video`
- File: Your video file (mp4, webm, avi, etc.)

**Example using Postman/Thunder Client:**
```
POST http://localhost:3000/api/upload/video
Content-Type: multipart/form-data

Body (form-data):
- video: [select your video file]
```

**Example Response:**
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "videoUrl": "https://res.cloudinary.com/xxx/video/upload/v1234/course-videos/video-xxx.mp4",
    "duration": 125.5,
    "publicId": "course-videos/video-xxx"
  }
}
```

#### Step 2: Update Course with Lesson Data
**Endpoint:** `PATCH /api/courses/:courseId`

**Request Body:**
```json
{
  "lessons": [
    {
      "title": "mod23",
      "videoUrl": "https://res.cloudinary.com/xxx/video/upload/v1234/course-videos/video-xxx.mp4",
      "duration": 125.5
    }
  ]
}
```

This will **append** the new lesson to existing lessons array.

---

### Option 2: Add Multiple Lessons at Once

**Endpoint:** `PATCH /api/courses/:courseId`

**Request Body:**
```json
{
  "lessons": [
    {
      "title": "Introduction to JavaScript",
      "videoUrl": "https://res.cloudinary.com/xxx/video/upload/course-videos/intro.mp4",
      "duration": 300
    },
    {
      "title": "Variables and Data Types",
      "videoUrl": "https://res.cloudinary.com/xxx/video/upload/course-videos/variables.mp4",
      "duration": 450
    }
  ]
}
```

---

## Complete Workflow Example

### Frontend Implementation (React/Next.js)

```typescript
// Upload video function
async function uploadVideo(file: File) {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch('http://localhost:3000/api/upload/video', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.data; // { videoUrl, duration, publicId }
}

// Add lesson to course
async function addLessonToCourse(courseId: string, lessonData: any) {
  const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // For cookies
    body: JSON.stringify({
      lessons: [lessonData]
    })
  });

  return await response.json();
}

// Complete workflow
async function handleVideoUpload(courseId: string, file: File, title: string) {
  try {
    // 1. Upload video to Cloudinary
    const videoData = await uploadVideo(file);
    
    // 2. Add lesson to course with video URL and duration
    const result = await addLessonToCourse(courseId, {
      title: title,
      videoUrl: videoData.videoUrl,
      duration: videoData.duration
    });
    
    console.log('Lesson added successfully:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### HTML Form Example

```html
<form id="uploadForm">
  <input type="text" id="lessonTitle" placeholder="Lesson Title" required />
  <input type="file" id="videoFile" accept="video/*" required />
  <button type="submit">Upload and Add Lesson</button>
</form>

<script>
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('lessonTitle').value;
  const file = document.getElementById('videoFile').files[0];
  const courseId = 'YOUR_COURSE_ID'; // Get from URL or context
  
  // Upload video
  const formData = new FormData();
  formData.append('video', file);
  
  const uploadResponse = await fetch('/api/upload/video', {
    method: 'POST',
    body: formData
  });
  
  const { data } = await uploadResponse.json();
  
  // Add to course
  const courseResponse = await fetch(`/api/courses/${courseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      lessons: [{
        title: title,
        videoUrl: data.videoUrl,
        duration: data.duration
      }]
    })
  });
  
  const result = await courseResponse.json();
  console.log('Success:', result);
});
</script>
```

---

## Benefits of This Approach

1. **Automatic Duration Calculation**: Cloudinary automatically extracts video duration
2. **Optimized Storage**: Videos stored in cloud, not on your server
3. **CDN Delivery**: Fast video delivery worldwide
4. **Appends Lessons**: New lessons are added to existing ones, not replaced
5. **Type Safety**: Full TypeScript support
6. **Error Handling**: Comprehensive error handling included

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/upload/video` | Upload video to Cloudinary | Yes |
| DELETE | `/api/upload/video` | Delete video from Cloudinary | Yes |
| PATCH | `/api/courses/:id` | Update course (add lessons) | Yes (Instructor/Admin) |

---

## Lesson Schema

```typescript
{
  title: string,          // Lesson title
  videoUrl: string,       // Cloudinary video URL
  duration: number,       // Duration in seconds (auto-calculated)
  assignment: ObjectId,   // Reference to Assignment (optional)
  quiz: ObjectId          // Reference to Quiz (optional)
}
```

---

## Testing with cURL

### Upload Video
```bash
curl -X POST http://localhost:3000/api/upload/video \
  -F "video=@/path/to/your/video.mp4"
```

### Add Lesson to Course
```bash
curl -X PATCH http://localhost:3000/api/courses/COURSE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "lessons": [{
      "title": "New Lesson",
      "videoUrl": "https://res.cloudinary.com/xxx/video.mp4",
      "duration": 125.5
    }]
  }'
```

---

## Duration Format

Duration is stored in **seconds**. To display in minutes:
```javascript
const durationInMinutes = Math.floor(duration / 60);
const seconds = duration % 60;
console.log(`${durationInMinutes}:${seconds.toString().padStart(2, '0')}`);
// Example: "2:05" for 125 seconds
```
