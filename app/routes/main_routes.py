from flask import Blueprint, render_template, jsonify, request
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

main_bp = Blueprint('main', __name__)

OMDB_API_KEY = os.getenv('OMDB_API_KEY', '')

@main_bp.route('/')
def index():
    """Render the main application page"""
    return render_template('index.html')

@main_bp.route('/api/search', methods=['GET'])
def search_media():
    """Search for movies and TV shows using OMDB API"""
    query = request.args.get('query', '')
    media_type = request.args.get('type', '')  # movie, series, or empty for both
    
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400
    
    # Construct the OMDB API URL
    url = f'http://www.omdbapi.com/?apikey={OMDB_API_KEY}&s={query}'
    
    if media_type:
        url += f'&type={media_type}'
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data.get('Response') == 'True':
            return jsonify(data)
        else:
            return jsonify({'error': data.get('Error', 'No results found')}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/api/details/<imdb_id>', methods=['GET'])
def get_media_details(imdb_id):
    """Get detailed information about a movie or TV show using OMDB API"""
    if not imdb_id:
        return jsonify({'error': 'IMDb ID is required'}), 400
    
    # Construct the OMDB API URL
    url = f'http://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={imdb_id}&plot=full'
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if data.get('Response') == 'True':
            return jsonify(data)
        else:
            return jsonify({'error': data.get('Error', 'Media not found')}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500