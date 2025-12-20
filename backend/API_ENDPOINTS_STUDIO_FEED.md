# Studio Feed API Endpoints

Quick reference for the Studio Feed (Community Posts) API.

## Base URL
- Local: `http://localhost:8080`
- Production: `https://pianostudio-api.fly.dev`

## Authentication
All endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Create Post
Create a new post in your studio.

**Endpoint:** `POST /api/posts`

**Request Body:**
```json
{
  "content": "Just finished practicing Moonlight Sonata! 🎹",
  "mediaUrl": "https://cloudinary.com/your-image.jpg",
  "mediaType": "IMAGE"
}
```

**Fields:**
- `content` (required): Post content, max 5000 characters
- `mediaUrl` (optional): URL to media file (Cloudinary)
- `mediaType` (optional): "IMAGE", "VIDEO", or "AUDIO"

**Response:** `201 Created`
```json
{
  "id": 1,
  "content": "Just finished practicing Moonlight Sonata! 🎹",
  "mediaUrl": "https://cloudinary.com/your-image.jpg",
  "mediaType": "IMAGE",
  "createdAt": "2025-12-10T16:30:00",
  "authorId": 5,
  "authorName": "Sarah Chen",
  "authorAvatar": "https://cloudinary.com/sarah.jpg",
  "reactions": {},
  "userReaction": null,
  "commentCount": 0
}
```

**Errors:**
- `403 Forbidden`: User not member of any studio
- `400 Bad Request`: Invalid request body

---

### 2. Get Posts (Paginated)
Retrieve posts from your studio.

**Endpoint:** `GET /api/posts`

**Query Parameters:**
- `page` (optional): Page number, default 0
- `size` (optional): Items per page, default 20, max 100

**Example:**
```
GET /api/posts?page=0&size=20
```

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": 3,
      "content": "Practice session complete! 🎵",
      "mediaUrl": null,
      "mediaType": null,
      "createdAt": "2025-12-10T18:00:00",
      "authorId": 7,
      "authorName": "Alex Martinez",
      "authorAvatar": "https://cloudinary.com/alex.jpg",
      "reactions": {
        "👏": 5,
        "🔥": 2,
        "⭐": 1
      },
      "userReaction": "👏",
      "commentCount": 0
    },
    {
      "id": 2,
      "content": "New piece assigned today!",
      "mediaUrl": "https://cloudinary.com/sheet-music.pdf",
      "mediaType": "IMAGE",
      "createdAt": "2025-12-10T14:30:00",
      "authorId": 5,
      "authorName": "Sarah Chen",
      "authorAvatar": "https://cloudinary.com/sarah.jpg",
      "reactions": {
        "❤️": 3
      },
      "userReaction": null,
      "commentCount": 0
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 2,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

**Errors:**
- `403 Forbidden`: User not member of any studio

---

### 3. Delete Post
Delete a post (author or teacher only).

**Endpoint:** `DELETE /api/posts/{id}`

**Path Parameters:**
- `id`: Post ID

**Example:**
```
DELETE /api/posts/123
```

**Response:** `204 No Content`

**Errors:**
- `404 Not Found`: Post doesn't exist
- `403 Forbidden`: Not authorized (not author and not teacher)

---

### 4. Add/Toggle Reaction
Add a reaction to a post. If same emoji already exists, it will be removed (toggle).

**Endpoint:** `POST /api/posts/{id}/reactions`

**Path Parameters:**
- `id`: Post ID

**Request Body:**
```json
{
  "emoji": "👏"
}
```

**Allowed Emojis:**
- 👏, ❤️, 🎉, 🎹, 🎵, 🎶, ⭐, 🔥, 💯, 👍, 🙌, 💪, 🌟

**Response:** `200 OK`
```json
{
  "id": 3,
  "content": "Practice session complete! 🎵",
  "mediaUrl": null,
  "mediaType": null,
  "createdAt": "2025-12-10T18:00:00",
  "authorId": 7,
  "authorName": "Alex Martinez",
  "authorAvatar": "https://cloudinary.com/alex.jpg",
  "reactions": {
    "👏": 6,
    "🔥": 2,
    "⭐": 1
  },
  "userReaction": "👏",
  "commentCount": 0
}
```

**Errors:**
- `404 Not Found`: Post doesn't exist
- `400 Bad Request`: Invalid emoji
- `403 Forbidden`: Not in same studio as post

---

### 5. Remove Reaction
Remove your reaction from a post.

**Endpoint:** `DELETE /api/posts/{id}/reactions`

**Path Parameters:**
- `id`: Post ID

**Example:**
```
DELETE /api/posts/123/reactions
```

**Response:** `200 OK`
```json
{
  "id": 3,
  "content": "Practice session complete! 🎵",
  "mediaUrl": null,
  "mediaType": null,
  "createdAt": "2025-12-10T18:00:00",
  "authorId": 7,
  "authorName": "Alex Martinez",
  "authorAvatar": "https://cloudinary.com/alex.jpg",
  "reactions": {
    "👏": 5,
    "🔥": 2,
    "⭐": 1
  },
  "userReaction": null,
  "commentCount": 0
}
```

**Errors:**
- `404 Not Found`: Post doesn't exist
- `403 Forbidden`: Not in same studio as post

---

### 6. Get Reaction Counts
Get reaction counts for a specific post.

**Endpoint:** `GET /api/posts/{id}/reactions`

**Path Parameters:**
- `id`: Post ID

**Example:**
```
GET /api/posts/123/reactions
```

**Response:** `200 OK`
```json
{
  "👏": 6,
  "🔥": 2,
  "⭐": 1
}
```

**Errors:**
- `404 Not Found`: Post doesn't exist

---

## Error Responses

All errors follow this format:

```json
{
  "timestamp": "2025-12-10T16:30:00.000",
  "status": 404,
  "error": "Not Found",
  "message": "Post not found with id: 123"
}
```

**Common HTTP Status Codes:**
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Successful deletion
- `400 Bad Request`: Invalid request body or parameters
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

---

## cURL Examples

### Create Post
```bash
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Just finished practicing! 🎹",
    "mediaUrl": "https://cloudinary.com/image.jpg",
    "mediaType": "IMAGE"
  }'
```

### Get Posts
```bash
curl -X GET "http://localhost:8080/api/posts?page=0&size=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Add Reaction
```bash
curl -X POST http://localhost:8080/api/posts/123/reactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emoji": "👏"}'
```

### Delete Post
```bash
curl -X DELETE http://localhost:8080/api/posts/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Frontend Integration Notes

### TypeScript Types

```typescript
interface Post {
  id: number;
  content: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'AUDIO';
  createdAt: string;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  reactions: Record<string, number>;
  userReaction?: string;
  commentCount: number;
}

interface PostRequest {
  content: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'AUDIO';
}

interface ReactionRequest {
  emoji: string;
}

interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}
```

### Axios Service Example

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const postService = {
  getPosts: (page = 0, size = 20) =>
    api.get<PagedResponse<Post>>(`/api/posts?page=${page}&size=${size}`),

  createPost: (data: PostRequest) =>
    api.post<Post>('/api/posts', data),

  deletePost: (id: number) =>
    api.delete(`/api/posts/${id}`),

  addReaction: (postId: number, emoji: string) =>
    api.post<Post>(`/api/posts/${postId}/reactions`, { emoji }),

  removeReaction: (postId: number) =>
    api.delete<Post>(`/api/posts/${postId}/reactions`),

  getReactionCounts: (postId: number) =>
    api.get<Record<string, number>>(`/api/posts/${postId}/reactions`)
};
```

---

## Testing Workflow

1. **Create a post** - Verify it appears in feed
2. **Get posts** - Confirm pagination works
3. **Add reaction** - Verify count increments
4. **Toggle reaction** - Add same emoji again, should remove
5. **Change reaction** - Add different emoji, should update
6. **Remove reaction** - Verify count decrements
7. **Delete post** - Confirm it's removed from feed
8. **Test authorization** - Try operations on other studio's posts
