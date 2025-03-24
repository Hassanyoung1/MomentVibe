# MomentVibe - Capture and Relive Your Moments

MomentVibe is a platform designed to help you capture, share, and relive your most cherished moments. Whether it's a wedding, a birthday party, or a casual get-together, MomentVibe provides the tools to collect media, engage with guests, and preserve memories for years to come.

## Features

*   **Event Creation:** Easily create events with details like name, description, and date.
*   **Guest Invitation:** Invite guests to your event and allow them to upload their photos and videos.
*   **Media Upload:** Guests can upload media using a unique QR code, making it easy to contribute to the event's collection.
*   **Automatic Album Creation:** Automatically organizes media into albums based on event timelines (Behind the Scenes, Main Event).
*   **Manual Album Management:** Create custom albums to categorize media as desired.
*   **Download & Sharing Permissions:** Control whether guests can download or share media from the event.
*   **Guestbook:** Allow guests to leave messages and reactions in a digital guestbook.
*   **Archived Events:** Expired events are automatically archived, preserving the memories for future viewing.
*   **User Authentication:** Secure user registration, login, and password reset functionality.
*   **Social Authentication:** (Planned) Integration with Google, Facebook, and Apple for easy signup.

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn
*   MongoDB
*   Redis
*   ClamAV (optional, for virus scanning)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd MomentVibe
    ```
2.  **Install backend dependencies:**

    ```bash
    cd backend
    npm install
    ```
3.  **Configure backend environment variables:**

    *   Create a `.env` file in the `backend` directory.
    *   Add the following environment variables, adjusting the values as needed:

        ```
        MONGO_URI=mongodb://localhost:27017/momentvibe
        REDIS_URL=redis://localhost:6379
        JWT_SECRET=<your_jwt_secret>
        SMTP_HOST=<your_smtp_host>
        SMTP_PORT=<your_smtp_port>
        SMTP_SECURE=false # or true, depending on your SMTP server
        EMAIL_USER=<your_email_address>
        EMAIL_PASS=<your_email_password>
        FRONTEND_URL=http://localhost:3000 # URL of your frontend
        CLAMAV_HOST=localhost
        CLAMAV_PORT=3310
        ```
4.  **Start the backend server:**

    ```bash
    npm run start
    ```
5.  **Install frontend dependencies:**

    ```bash
    cd ../frontend
    npm install
    ```
6.  **Configure frontend environment variables:**

    *   The frontend primarily uses environment variables defined in the backend.  Ensure the  in the backend `.env` is correctly set.
7.  **Start the frontend development server:**

    ```bash
    npm run dev
    ```

## API Documentation

### Base URL

All API endpoints are prefixed with `/api`.  The backend server, by default, runs on port 5000.  Therefore, the full base URL is `http://localhost:5000/api`.

### Authentication (`/api/auth`)

*   **`POST /register`**: Registers a new user.
    *   Request body:
        ```json
        {
            "email": "<user_email>",
            "password": "<user_password>"
        }
        ```
    *   Response:
        *   Success (201): `{ "message": "User registered successfully. Please check your email to confirm your account." }`
        *   Error (400): `{ "error": "Missing email or password" }` or `{ "error": "User already exists" }`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`POST /login`**: Logs in an existing user.
    *   Request body:
        ```json
        {
            "email": "<user_email>",
            "password": "<user_password>"
        }
        ```
    *   Response:
        *   Success (200): `{ "token": "<jwt_token>" }`
        *   Error (401): `{ "error": "Unauthorized" }`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`POST /logout`**: Logs out the current user. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Response:
        *   Success (200): `{ "message": "Logged out successfully" }`
        *   Error (401): `{ "error": "Unauthorized: No authorization header provided" }` or `{ "error": "Unauthorized: No token provided" }`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`POST /request-password-reset`**: Requests a password reset email.
    *   Request body:
        ```json
        {
            "email": "<user_email>"
        }
        ```
    *   Response:
        *   Success (200): `{ "message": "Password reset email sent" }`
        *   Error (400): `{ "error": "Missing email" }` or `{ "error": "User not found" }`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`POST /reset-password`**: Resets the user's password.
    *   Request body:
        ```json
        {
            "token": "<reset_token>",
            "newPassword": "<new_password>"
        }
        ```
    *   Response:
        *   Success (200): `{ "message": "Password reset successfully" }`
        *   Error (400): `{ "error": "Missing token or new password" }` or `{ "error": "Invalid or expired token" }`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`GET /confirm-email`**: Confirms the user's email address.
    *   Query parameters:
        *   : `<confirmation_token>`
    *   Response:
        *   Success (200): `{ "message": "Email confirmed successfully" }`
        *   Error (400): `{ "error": "Missing token" }` or `{ "error": "Invalid or expired token" }`
        *   Error (500): `{ "error": "Internal Server Error" }`

### Events (`/api/events`)

*   **`POST /create`**: Creates a new event. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Request body:
        ```json
        {
            "name": "<event_name>",
            "description": "<event_description>",
            "date": "<event_date>" // ISO 8601 format
        }
        ```
    *   Response:
        *   Success (201): `{ "message": "Event created successfully", "event": <event_object> }`
        *   Error (400): `{ "error": "Missing required fields" }`
        *   Error (500): `{ "error": "Failed to create event" }`
*   **`PUT /:eventId`**: Updates an existing event. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Request body: (same as `POST /create`)
    *   Response:
        *   Success (200): `{ "message": "Event updated successfully", "event": <event_object> }`
        *   Error (400): `{ "error": "Missing required fields" }`
        *   Error (404): `{ "error": "Event not found" }`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`DELETE /:eventId`**: Deletes an event. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Response:
        *   Success (200): `{ "message": "Event deleted successfully" }`
        *   Error (404): `{ "error": "Event not found" }`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`GET /:id`**: Retrieves a specific event by ID.
    *   Response:
        *   Success (200): `<event_object>`
        *   Error (400): `{ "error": "Invalid event ID" }`
        *   Error (404): `{ "error": "Event not found" }`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`GET /host/events`**: Retrieves all events for the logged-in host. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Response:
        *   Success (200): `[<event_object>, <event_object>, ...]`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`GET /events/date-range`**: Retrieves events within a specified date range. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Query parameters:
        *   : `<start_date>` (ISO 8601 format)
        *   : `<end_date>` (ISO 8601 format)
    *   Response:
        *   Success (200): `[<event_object>, <event_object>, ...]`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`GET /events/paginated`**: Retrieves events in a paginated format. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Query parameters:
        *   : `<page_number>` (default: 1)
        *   : `<items_per_page>` (default: 10)
    *   Response:
        ```json
        {
            "events": [<event_object>, <event_object>, ...],
            "totalPages": <total_pages>,
            "currentPage": <current_page>
        }
        ```
    *   Error (500): `{ "error": "Internal Server Error" }`
*   **`GET /events/filter`**: Retrieves events based on specified filters. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Query parameters:
        *   : `<event_name>` (substring match)
        *   : `<event_date>` (ISO 8601 format)
        *   : `<field_to_sort_by>` (default: )
        *   : `<sort_order>` (`asc` or `desc`, default: `asc`)
    *   Response:
        *   Success (200): `[<event_object>, <event_object>, ...]`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`GET /:eventId/qr`**: Generates a QR code for the event.
    *   Response:
        *   Success (201): `{ "message": "QR Code generated", "qrUploadUrl": "<qr_upload_url>", "qrImage": "<qr_image_data>" }`
        *   Success (200): `{ "message": "QR Code already exists", "qrUploadUrl": "<qr_upload_url>" }`
        *   Error (404): `{ "error": "Event not found" }`
        *   Error (500): `{ "error": "Failed to generate QR code" }`
*   **`GET /:eventId/guest-qr`**: Generates a QR code for guests to upload media, including a unique guest token.
    *   Request body (optional):
        ```json
        {
            "guestName": "<guest_name>",
            "guestEmail": "<guest_email>"
        }
        ```
    *   Response: `{ "qrUploadUrl": "<qr_upload_url>", "qrImage": "<qr_image_data>", "guestToken": "<guest_token>" }`
    *   Error (500): `{ "error": "Failed to generate QR code" }`
*   **`PUT /:eventId/permissions`**: Updates download and sharing permissions for an event. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Request body:
        ```json
        {
            "allowDownload": <true|false>,
            "allowSharing": <true|false>
        }
        ```
    *   Response:
        *   Success (200): `{ "message": "Permissions updated successfully", "event": <event_object> }`
        *   Error (404): `{ "error": "Event not found" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`PUT /:eventId/extend-expiration`**: Extends the expiration date of an event. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Request body:
        ```json
        {
            "newExpirationDate": "<new_expiration_date>" // ISO 8601 format
        }
        ```
    *   Response:
        *   Success (200): `{ "message": "Event expiration updated", "event": <event_object> }`
        *   Error (400): `{ "error": "New expiration date is required" }`
        *   Error (404): `{ "error": "Event not found" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`GET /:eventId/download-all`**: Downloads all media for an event as a ZIP file. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Response:  A ZIP file containing all media.
        *   Error (404): `{ "error": "Event not found" }`
        *   Error (500): `{ "error": "Failed to download media" }`
*   **`PUT /:eventId/download-permission`**: Updates the download permission for an event. Requires a valid JWT token in the `Authorization` header.
     *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Request body:
        ```json
        {
            "allowDownload": <true|false>
        }
        ```
    *   Response:
        *   Success (200): `{ "message": "Download permission updated", "allowDownload": <true|false> }`
        *   Error (404): `{ "error": "Event not found" }`
        *   Error (500): `{ "error": "Internal server error" }`

### Guests (`/api/guests`)

*   **`POST /register`**: Registers a guest for an event.
    *   Request body:
        ```json
        {
            "eventId": "<event_id>",
            "name": "<guest_name>",
            "email": "<guest_email>"
        }
        ```
    *   Response:
        *   Success (201): `{ "message": "Guest registered successfully", "guest": <guest_object> }`
        *   Error (400): `{ "error": "Missing required fields" }`
        *   Error (500): `{ "error": "Internal Server Error" }`

### Media (`/api/media`)

*   **`POST /upload`**: Uploads media to an event. Requires a valid JWT token in the `Authorization` header.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Request body (multipart/form-data):
        *   : `<event_id>`
        *   : `<file>` (the media file)
        *   : `<visibility_date>` (optional, ISO 8601 format)
        *   : `<album_id>` (optional)
    *   Response:
        *   Success (201): `{ "message": "Media uploaded successfully", "media": <media_object> }`
        *   Error (400): `{ "error": "Missing required fields" }`
        *   Error (404): `{ "error": "Event not found" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`POST /guest/upload`**: Uploads media as a guest.
    *   Request body (multipart/form-data):
        *   : `<event_id>`
        *   : `<file>` (the media file)
        *   : `<guest_token>` (optional, will be set as a cookie if not provided)
        *   : `<guest_name>` (optional)
        *   : `<guest_email>` (optional)
    *   Response:
        *   Success (201): `{ "message": "Media uploaded successfully", "media": <media_object> }`
        *   Error (400): `{ "error": "Missing required fields" }`
        *   Error (404): `{ "error": "Event not found" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`GET /:eventId`**: Retrieves all visible media for an event.
    *   Response:
        *   Success (200): `[<media_object>, <media_object>, ...]`
        *   Error (400): `{ "error": "Invalid event ID format" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`PUT /approve/:mediaId`**: Approves a media item. Requires a valid JWT token in the `Authorization` header and the user must have the 'host' role.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Response:
        *   Success (200): `{ "message": "Media approved successfully", "media": <media_object> }`
        *   Error (404): `{ "error": "Media not found" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`GET /live/:eventId`**: Retrieves the latest 10 uploaded media items for an event.
    *   Response:
        *   Success (200): `[<media_object>, <media_object>, ...]`
        *   Error (500): `{ "error": "Internal Server Error" }`
*   **`PUT /:mediaId/visibility`**: Updates the visibility time of a media item. Requires a valid JWT token in the `Authorization` header and the user must have the 'host' role.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Request body:
        ```json
        {
            "visibleAt": "<visibility_date>" // ISO 8601 format
        }
        ```
    *   Response:
        *   Success (200): `{ "message": "Media visibility updated", "media": <media_object> }`
        *   Error (400): `{ "error": "New visibility time required" }`
        *   Error (404): `{ "error": "Media not found" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`GET /host`**: Retrieves all media uploaded by the host. Requires a valid JWT token in the `Authorization` header and the user must have the 'host' role.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Response:
        *   Success (200): `[<media_object>, <media_object>, ...]`
        *   Error (404): `{ "error": "No media found for this host" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`GET /download/:mediaId`**: Downloads a specific media file.
    *   Response: The media file.
        *   Error (404): `{ "error": "Media not found" }` or `{ "error": "Event not found" }` or `{ "error": "File not found" }`
        *   Error (403): `{ "error": "Downloading is disabled for this event" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`GET /file/:fileId`**: Retrieves a specific media file for inline display.
    *   Response: The media file.
        *   Error (400): `{ "error": "Invalid file ID" }`
        *   Error (404): `{ "error": "File not found" }` or `{ "error": "Associated event not found" }`
        *   Error (403): `{ "error": "Downloading is disabled for this event" }`
        *   Error (500): `{ "error": "Internal server error" }`

### Host (`/api/host`)

*   **`GET /:hostId`**: Retrieves data associated with a specific host. Requires a valid JWT token in the `Authorization` header and the user must have the 'host' role.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Response:
        ```json
        {
            "host": <user_object>,
            "events": [<event_object>, ...],
            "guests": [<guest_object>, ...],
            "media": [<media_object>, ...]
        }
        ```
    *   Error (400): `{ "error": "Missing required parameter: hostId" }`
    *   Error (404): `{ "error": "Host not found" }`
    *   Error (500): `{ "error": "Internal Server Error" }`

### Albums (`/api/albums`)

*   **`POST /:eventId/create`**: Creates a new album for an event. Requires a valid JWT token in the `Authorization` header and the user must have the 'host' role.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Request body:
        ```json
        {
            "name": "<album_name>",
            "description": "<album_description>"
        }
        ```
    *   Response:
        *   Success (201): `{ "message": "Album created successfully", "album": <album_object> }`
        *   Error (400): `{ "error": "Event ID and album name are required." }` or `{ "error": "Invalid eventId format." }`
        *   Error (404): `{ "error": "Event not found" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`GET /:eventId`**: Retrieves all albums for an event.
    *   Response:
        *   Success (200): `[<album_object>, <album_object>, ...]`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`PUT /:albumId`**: Updates an existing album. Requires a valid JWT token in the `Authorization` header and the user must have the 'host' role.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Request body:
        ```json
        {
            "name": "<album_name>",
            "description": "<album_description>",
            "visibility": "<public|private>"
        }
        ```
    *   Response:
        *   Success (200): `{ "message": "Album updated successfully", "album": <album_object> }`
        *   Error (404): `{ "error": "Album not found" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`DELETE /:albumId`**: Deletes an album. Requires a valid JWT token in the `Authorization` header and the user must have the 'host' role.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Response:
        *   Success (200): `{ "message": "Album deleted successfully" }`
        *   Error (404): `{ "error": "Album not found" }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`PUT /move-media`**: Moves media from one album to another. Requires a valid JWT token in the `Authorization` header and the user must have the 'host' role.
    *   Request Headers:
        *   `Authorization: Bearer <jwt_token>`
    *   Request body:
        ```json
        {
            "mediaId": "<media_id>",
            "newAlbumId": "<new_album_id>"
        }
        ```
    *   Response:
        *   Success (200): `{ "message": "Media moved successfully", "media": <media_object> }`
        *   Error (400): `{ "error": "Invalid mediaId. Must be a valid MongoDB ObjectId." }` or `{ "error": "Invalid newAlbumId. Must be a valid MongoDB ObjectId." }`
        *   Error (404): `{ "error": "Media not found" }`
        *   Error (500): `{ "error": "Internal server error" }`

### Guestbook (`/api/guestbook`)

*   **`POST /:eventId/add-message`**: Adds a message to the guestbook for an event.
    *   Request body:
        ```json
        {
            "guestName": "<guest_name>",
            "message": "<guest_message>"
        }
        ```
    *   Response:
        *   Success (201): `{ "message": "Guestbook entry added!", "data": <guestbook_message_object> }`
        *   Error (400): `{ "error": "Guest name and message are required." }`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`GET /:eventId/messages`**: Retrieves all messages for an event's guestbook.
    *   Response:
        *   Success (200): `[<guestbook_message_object>, <guestbook_message_object>, ...]`
        *   Error (500): `{ "error": "Internal server error" }`
*   **`POST /:messageId/react`**: Adds a reaction to a guestbook message.
    *   Request body:
        ```json
        {
            "reactionType": "<like|love|laugh>"
        }
        ```
    *   Response:
        *   Success (200): `{ "message": "Reaction added!", "data": <guestbook_message_object> }`
        *   Error (400): `{ "error": "Invalid reaction type." }`
        *   Error (404): `{ "error": "Message not found." }`
        *   Error (500): `{ "error": "Internal server error" }`

### Archived Events (`/api/archived-events`)

*   **`GET /:eventId`**: Retrieves an archived event by its original event ID.
    *   Response:
        *   Success (200): `<archived_event_object>`
        *   Error (404): `{ "error": "Archived event not found" }`
        *   Error (500): `{ "error": "Internal server error" }`

## Contributing
## Contributors

We'd like to thank the following people who have contributed to this project:

*   [Hassan Olaoluwa Hakeem](https://github.com/hassanyoung1)

*   [Contributor 2 Name](https://github.com/contributor2) 
*   [Contributor 3 Name](https://github.com/contributor3)  


Contributions are welcome! Please fork the repository and submit a pull request with your changes.


## License

MIT