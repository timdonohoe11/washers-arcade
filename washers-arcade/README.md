# Washers Scoreboard App

A fun, offline browser-based scoreboard app for the game "Washers" with a playful, colorful design.

## Features

- **Two Teams**: TEAL vs WHITE
- **Simple Scoring**: Choose team → Choose points → Auto-add
- **Win Conditions**: 
  - First to 21 wins by 2
  - Shutout: 11+ with opponent at 0
- **Three Themes**: Space, Clouds, Sunrise
- **WASH Animation**: Plays GIF when WASH button is clicked
- **Score Persistence**: Saves scores and theme via localStorage
- **Responsive Design**: Works on iPhone, iPad, desktop

## File Structure

```
washers-scoreboard/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles and themes
├── js/
│   └── app.js          # Game logic and functionality
├── assets/
│   └── wash-video.gif  # WASH animation (place your GIF here)
└── README.md           # This file
```

## Setup

1. **Place your GIF file**: 
   - Put your `wash-video.gif` file in the `assets/` folder
   - Or update the path in `index.html` if using a different name/location

2. **Open the app**:
   - Double-click `index.html` to open in your browser
   - Or serve it from a local web server

## How to Use

1. **Select a team**: Click TEAL or WHITE card
2. **Select points**: Click WASH (0 points) or 1-9
3. **Points are added automatically**: Ready for next round!

## Game Rules

- **WASH**: Zero points, shows animation
- **Win by 2**: Must win by at least 2 points when reaching 21
- **Shutout**: Automatic win if you score 11+ while opponent has 0

## Customization

- **Change GIF**: Replace `assets/wash-video.gif` with your own
- **Adjust GIF display time**: Edit the timeout in `js/app.js` (line ~350, default: 5000ms)
- **Modify themes**: Edit CSS variables in `css/styles.css`

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers

## Offline Support

The app works completely offline - no internet connection required!

