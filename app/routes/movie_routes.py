from flask import Blueprint, jsonify, request
from app import db
from app.models.models import Movie
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

movie_bp = Blueprint('movies', __name__, url_prefix='/api/movies')

OMDB_API_KEY = os.getenv('OMDB_API_KEY', '')

@movie_bp.route('/', methods=['GET'])
def get_all_movies():
    """Get all movies in the user's collection"""
    # Get filter parameters
    genre = request.args.get('genre')
    year = request.args.get('year')
    watched = request.args.get('watched')
    watch_later = request.args.get('watch_later')
    search = request.args.get('search', '').lower()
    
    # Start with all movies
    query = Movie.query
    
    # Apply filters
    if genre:
        query = query.filter(Movie.genre.contains(genre))
    if year:
        query = query.filter(Movie.year == year)
    if watched is not None:
        watched_bool = watched.lower() == 'true'
        query = query.filter(Movie.watched == watched_bool)
    if watch_later is not None:
        watch_later_bool = watch_later.lower() == 'true'
        query = query.filter(Movie.watch_later == watch_later_bool)
    if search:
        query = query.filter(Movie.title.ilike(f'%{search}%'))
    
    # Execute query and convert to dict
    movies = [movie.to_dict() for movie in query.all()]
    
    return jsonify(movies)

@movie_bp.route('/<int:movie_id>', methods=['GET'])
def get_movie(movie_id):
    """Get a specific movie by ID"""
    movie = Movie.query.get_or_404(movie_id)
    return jsonify(movie.to_dict())

@movie_bp.route('/', methods=['POST'])
def add_movie():
    """Add a new movie to the collection"""
    data = request.json
    
    # Check if movie with this IMDb ID already exists
    if 'imdb_id' in data and data['imdb_id']:
        existing_movie = Movie.query.filter_by(imdb_id=data['imdb_id']).first()
        if existing_movie:
            return jsonify({'error': 'Movie already exists in your collection'}), 400
    
    # If IMDb ID is provided but other data is missing, fetch from OMDB
    if 'imdb_id' in data and data['imdb_id'] and OMDB_API_KEY:
        if not all(key in data for key in ['title', 'year', 'genre', 'director', 'poster_url', 'plot']):
            try:
                omdb_url = f'http://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={data["imdb_id"]}&plot=full'
                response = requests.get(omdb_url)
                omdb_data = response.json()
                
                if omdb_data.get('Response') == 'True':
                    # Update data with OMDB information
                    data['title'] = omdb_data.get('Title', data.get('title', ''))
                    data['year'] = int(omdb_data.get('Year', '0').split('–')[0]) or data.get('year')
                    data['genre'] = omdb_data.get('Genre', data.get('genre', ''))
                    data['director'] = omdb_data.get('Director', data.get('director', ''))
                    data['poster_url'] = omdb_data.get('Poster', data.get('poster_url', ''))
                    data['plot'] = omdb_data.get('Plot', data.get('plot', ''))
            except Exception as e:
                # Continue with user-provided data if OMDB fetch fails
                pass
    
    # Create new movie
    new_movie = Movie(
        title=data.get('title', ''),
        year=data.get('year'),
        genre=data.get('genre', ''),
        director=data.get('director', ''),
        poster_url=data.get('poster_url', ''),
        plot=data.get('plot', ''),
        imdb_id=data.get('imdb_id', ''),
        watched=data.get('watched', False),
        rating=data.get('rating'),
        notes=data.get('notes', ''),
        watch_later=data.get('watch_later', False)
    )
    
    db.session.add(new_movie)
    db.session.commit()
    
    return jsonify(new_movie.to_dict()), 201

@movie_bp.route('/<int:movie_id>', methods=['PUT'])
def update_movie(movie_id):
    """Update a movie's information"""
    movie = Movie.query.get_or_404(movie_id)
    data = request.json
    
    # Update fields if provided
    if 'title' in data:
        movie.title = data['title']
    if 'year' in data:
        movie.year = data['year']
    if 'genre' in data:
        movie.genre = data['genre']
    if 'director' in data:
        movie.director = data['director']
    if 'poster_url' in data:
        movie.poster_url = data['poster_url']
    if 'plot' in data:
        movie.plot = data['plot']
    if 'watched' in data:
        movie.watched = data['watched']
    if 'rating' in data:
        movie.rating = data['rating']
    if 'notes' in data:
        movie.notes = data['notes']
    if 'watch_later' in data:
        movie.watch_later = data['watch_later']
    
    db.session.commit()
    
    return jsonify(movie.to_dict())

@movie_bp.route('/<int:movie_id>', methods=['DELETE'])
def delete_movie(movie_id):
    """Delete a movie from the collection"""
    movie = Movie.query.get_or_404(movie_id)
    
    db.session.delete(movie)
    db.session.commit()
    
    return jsonify({'message': 'Movie deleted successfully'})