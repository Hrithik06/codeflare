## auth

- POST /signup
- POST /login
- POST /logout

## profile

- GET /profile
- PATCH /profile/edit
- PATCH /profile/password
- GET /profile/upload-url
- GET /profile/download-url

## connection/requests

- POST /request/send/interested/:userId
- POST /request/send/ignored/:userId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

## user

- GET /user/connections
- GET /user/requests
- GET /user/feed

## chat
- GET /chat/targetUserId
