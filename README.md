# CineMate - Movie & TV Series Manager

A beautiful, modern web application for managing your movies and TV shows with a glassmorphism UI.

## Features

- Add movies and TV shows to your personal collection
- Track watched status for movies
- Track watched episodes for TV shows with progress bars
- Search and filter by name, genre, year, and watched status
- Add notes and ratings to your media
- Import metadata from OMDB API
- Export and import your collection
- Dark/light theme toggle
- Watch later list
- Responsive design

## Tech Stack

- **Backend**: Python Flask with REST API
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **Deployment**: Render (https://render.com)

## Setup Instructions

### Prerequisites

- Python 3.8+
- OMDB API Key (Get one from http://www.omdbapi.com/)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cinemate.git
   cd cinemate
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file in the project root
   - Add the following variables:
     ```
     DATABASE_URL=sqlite:///cinemate.db
     OMDB_API_KEY=your_omdb_api_key_here
     ```

5. Run the application:
   ```
   python app.py
   ```

6. Open your browser and navigate to `http://localhost:5000`

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. Add the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL database URL (Render provides this if you create a PostgreSQL database)
   - `OMDB_API_KEY`: Your OMDB API key

## License

MIT

## Acknowledgements

- [OMDB API](http://www.omdbapi.com/) for movie and TV show metadata
- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for typography