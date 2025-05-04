from app import db
from datetime import datetime

class Movie(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    year = db.Column(db.Integer)
    genre = db.Column(db.String(100))
    director = db.Column(db.String(100))
    poster_url = db.Column(db.String(500))
    plot = db.Column(db.Text)
    imdb_id = db.Column(db.String(20), unique=True)
    watched = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    watch_later = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'year': self.year,
            'genre': self.genre,
            'director': self.director,
            'poster_url': self.poster_url,
            'plot': self.plot,
            'imdb_id': self.imdb_id,
            'watched': self.watched,
            'rating': self.rating,
            'notes': self.notes,
            'watch_later': self.watch_later,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class TVShow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    year = db.Column(db.Integer)
    genre = db.Column(db.String(100))
    creator = db.Column(db.String(100))
    poster_url = db.Column(db.String(500))
    plot = db.Column(db.Text)
    imdb_id = db.Column(db.String(20), unique=True)
    total_episodes = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    watch_later = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    episodes = db.relationship('Episode', backref='tv_show', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        watched_episodes = sum(1 for episode in self.episodes if episode.watched)
        return {
            'id': self.id,
            'title': self.title,
            'year': self.year,
            'genre': self.genre,
            'creator': self.creator,
            'poster_url': self.poster_url,
            'plot': self.plot,
            'imdb_id': self.imdb_id,
            'total_episodes': self.total_episodes,
            'watched_episodes': watched_episodes,
            'progress': round((watched_episodes / self.total_episodes) * 100) if self.total_episodes > 0 else 0,
            'rating': self.rating,
            'notes': self.notes,
            'watch_later': self.watch_later,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'episodes': [episode.to_dict() for episode in self.episodes]
        }

class Episode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tv_show_id = db.Column(db.Integer, db.ForeignKey('tv_show.id'), nullable=False)
    season = db.Column(db.Integer, default=1)
    episode_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=True)
    watched = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'tv_show_id': self.tv_show_id,
            'season': self.season,
            'episode_number': self.episode_number,
            'title': self.title,
            'watched': self.watched
        }