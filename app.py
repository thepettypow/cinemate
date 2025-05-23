from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, 
            static_folder='app/static',
            template_folder='app/templates')

# Configure database
database_url = os.getenv('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    # Render uses PostgreSQL, but SQLAlchemy requires "postgresql://"
    database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    # Fallback to SQLite for local development
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///cinemate.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS
CORS(app)

# Initialize database
db = SQLAlchemy(app)

# Import models
from app.models.models import Movie, TVShow, Episode

# Import routes
from app.routes.movie_routes import movie_bp
from app.routes.tv_routes import tv_bp
from app.routes.main_routes import main_bp

# Register blueprints
app.register_blueprint(movie_bp)
app.register_blueprint(tv_bp)
app.register_blueprint(main_bp)

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)