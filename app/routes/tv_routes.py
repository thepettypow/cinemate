from flask import Blueprint, jsonify, request
from app import db
from app.models.models import TVShow, Episode
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

tv_bp = Blueprint('tv', __name__, url_prefix='/api/tv')

OMDB_API_KEY = os.getenv('OMDB_API_KEY', '')

@tv_bp.route('/', methods=['GET'])
def get_all_tv_shows():
    """Get all TV shows in the user's collection"""
    # Get filter parameters
    genre = request.args.get('genre')
    year = request.args.get('year')
    watch_later = request.args.get('watch_later')
    search = request.args.get('search', '').lower()
    
    # Start with all TV shows
    query = TVShow.query
    
    # Apply filters
    if genre:
        query = query.filter(TVShow.genre.contains(genre))
    if year:
        query = query.filter(TVShow.year == year)
    if watch_later is not None:
        watch_later_bool = watch_later.lower() == 'true'
        query = query.filter(TVShow.watch_later == watch_later_bool)
    if search:
        query = query.filter(TVShow.title.ilike(f'%{search}%'))
    
    # Execute query and convert to dict
    tv_shows = [show.to_dict() for show in query.all()]
    
    return jsonify(tv_shows)

@tv_bp.route('/<int:tv_id>', methods=['GET'])
def get_tv_show(tv_id):
    """Get a specific TV show by ID"""
    tv_show = TVShow.query.get_or_404(tv_id)
    return jsonify(tv_show.to_dict())

@tv_bp.route('/', methods=['POST'])
def add_tv_show():
    """Add a new TV show to the collection"""
    data = request.json
    
    # Check if TV show with this IMDb ID already exists
    if 'imdb_id' in data and data['imdb_id']:
        existing_show = TVShow.query.filter_by(imdb_id=data['imdb_id']).first()
        if existing_show:
            return jsonify({'error': 'TV show already exists in your collection'}), 400
    
    # If IMDb ID is provided but other data is missing, fetch from OMDB
    if 'imdb_id' in data and data['imdb_id'] and OMDB_API_KEY:
        if not all(key in data for key in ['title', 'year', 'genre', 'creator', 'poster_url', 'plot']):
            try:
                omdb_url = f'http://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={data["imdb_id"]}&plot=full'
                response = requests.get(omdb_url)
                omdb_data = response.json()
                
                if omdb_data.get('Response') == 'True':
                    # Update data with OMDB information
                    data['title'] = omdb_data.get('Title', data.get('title', ''))
                    data['year'] = int(omdb_data.get('Year', '0').split('–')[0]) or data.get('year')
                    data['genre'] = omdb_data.get('Genre', data.get('genre', ''))
                    data['creator'] = omdb_data.get('Writer', data.get('creator', ''))
                    data['poster_url'] = omdb_data.get('Poster', data.get('poster_url', ''))
                    data['plot'] = omdb_data.get('Plot', data.get('plot', ''))
            except Exception as e:
                # Continue with user-provided data if OMDB fetch fails
                pass
    
    # Create new TV show
    new_tv_show = TVShow(
        title=data.get('title', ''),
        year=data.get('year'),
        genre=data.get('genre', ''),
        creator=data.get('creator', ''),
        poster_url=data.get('poster_url', ''),
        plot=data.get('plot', ''),
        imdb_id=data.get('imdb_id', ''),
        total_episodes=data.get('total_episodes', 0),
        rating=data.get('rating'),
        notes=data.get('notes', ''),
        watch_later=data.get('watch_later', False)
    )
    
    db.session.add(new_tv_show)
    db.session.commit()
    
    # Create episodes if total_episodes is provided
    if data.get('total_episodes', 0) > 0:
        for i in range(1, data.get('total_episodes') + 1):
            episode = Episode(
                tv_show_id=new_tv_show.id,
                season=1,  # Default to season 1
                episode_number=i,
                title=f"Episode {i}",
                watched=False
            )
            db.session.add(episode)
        
        db.session.commit()
    
    return jsonify(new_tv_show.to_dict()), 201

@tv_bp.route('/<int:tv_id>', methods=['PUT'])
def update_tv_show(tv_id):
    """Update a TV show's information"""
    tv_show = TVShow.query.get_or_404(tv_id)
    data = request.json
    
    # Update fields if provided
    if 'title' in data:
        tv_show.title = data['title']
    if 'year' in data:
        tv_show.year = data['year']
    if 'genre' in data:
        tv_show.genre = data['genre']
    if 'creator' in data:
        tv_show.creator = data['creator']
    if 'poster_url' in data:
        tv_show.poster_url = data['poster_url']
    if 'plot' in data:
        tv_show.plot = data['plot']
    if 'rating' in data:
        tv_show.rating = data['rating']
    if 'notes' in data:
        tv_show.notes = data['notes']
    if 'watch_later' in data:
        tv_show.watch_later = data['watch_later']
    
    # Handle total_episodes update
    if 'total_episodes' in data and data['total_episodes'] != tv_show.total_episodes:
        old_total = tv_show.total_episodes
        new_total = data['total_episodes']
        
        if new_total > old_total:
            # Add new episodes
            for i in range(old_total + 1, new_total + 1):
                episode = Episode(
                    tv_show_id=tv_show.id,
                    season=1,  # Default to season 1
                    episode_number=i,
                    title=f"Episode {i}",
                    watched=False
                )
                db.session.add(episode)
        elif new_total < old_total:
            # Remove excess episodes
            episodes_to_remove = Episode.query.filter_by(tv_show_id=tv_show.id).filter(Episode.episode_number > new_total).all()
            for episode in episodes_to_remove:
                db.session.delete(episode)
        
        tv_show.total_episodes = new_total
    
    db.session.commit()
    
    return jsonify(tv_show.to_dict())

@tv_bp.route('/<int:tv_id>', methods=['DELETE'])
def delete_tv_show(tv_id):
    """Delete a TV show from the collection"""
    tv_show = TVShow.query.get_or_404(tv_id)
    
    db.session.delete(tv_show)
    db.session.commit()
    
    return jsonify({'message': 'TV show deleted successfully'})

@tv_bp.route('/<int:tv_id>/episodes', methods=['GET'])
def get_episodes(tv_id):
    """Get all episodes for a TV show"""
    tv_show = TVShow.query.get_or_404(tv_id)
    episodes = [episode.to_dict() for episode in tv_show.episodes]
    
    return jsonify(episodes)

@tv_bp.route('/<int:tv_id>/episodes/<int:episode_id>', methods=['PUT'])
def update_episode(tv_id, episode_id):
    """Update an episode's information"""
    episode = Episode.query.filter_by(id=episode_id, tv_show_id=tv_id).first_or_404()
    data = request.json
    
    # Update fields if provided
    if 'title' in data:
        episode.title = data['title']
    if 'season' in data:
        episode.season = data['season']
    if 'watched' in data:
        episode.watched = data['watched']
    
    db.session.commit()
    
    return jsonify(episode.to_dict())