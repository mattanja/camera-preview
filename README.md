# 📹 Camera Preview

A simple, modern web application that displays your webcam feed using Angular and the WebRTC getUserMedia API.

## Features

- 🎥 Real-time webcam preview
- 🎨 Modern, responsive UI with gradient backgrounds
- 🔒 Secure camera access with proper error handling
- 📱 Mobile-friendly design
- ⚡ Fast and lightweight
- 🛡️ Proper resource cleanup

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- A webcam/camera device
- Modern web browser with WebRTC support

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

   Or for production build:
   ```bash
   npm run build
   npm run serve
   ```

2. Open your browser and navigate to `http://localhost:4200`

3. Click "Start Camera" to begin the webcam preview

## Usage

- **Start Camera**: Click the "Start Camera" button to begin streaming
- **Stop Camera**: Click the "Stop Camera" button to stop the stream
- **Permissions**: Your browser will ask for camera permission on first use

## Browser Compatibility

This app uses the modern `getUserMedia` API, which is supported in:
- Chrome 21+
- Firefox 17+
- Safari 11+
- Edge 12+

## Security Notes

- Camera access requires HTTPS in production
- The app only requests video access (no audio)
- All camera streams are properly cleaned up when stopped

## Troubleshooting

### Camera not working?
- Ensure your camera is not being used by another application
- Check browser permissions in settings
- Try refreshing the page
- Make sure you're using HTTPS in production

### Permission denied?
- Click the camera icon in your browser's address bar
- Allow camera access in browser settings
- Try using a different browser

## Development

This project uses:
- Angular 17 (standalone components)
- TypeScript
- SCSS for styling
- WebRTC getUserMedia API

## License

MIT License - feel free to use and modify as needed!
