// DOM Elements
const sidebarLinks = document.querySelectorAll('.sidebar nav ul li');
const sections = document.querySelectorAll('section');
const themeToggle = document.getElementById('theme-toggle-icon');
const movieGrid = document.getElementById('movies-grid');
const tvShowsGrid = document.getElementById('tv-shows-grid');
const watchLaterGrid = document.getElementById('watch-later-grid');
const recentItemsGrid = document.getElementById('recent-items-grid');
const addMovieBtn = document.getElementById('add-movie-btn');
const addTvBtn = document.getElementById('add-tv-btn');
const movieModal = document.getElementById('movie-modal');
const tvModal = document.getElementById('tv-modal');
const tvDetailsModal = document.getElementById('tv-details-modal');
const movieDetailsModal = document.getElementById('movie-details-modal');
const movieForm = document.getElementById('movie-form');
const tvForm = document.getElementById('tv-form');
const movieSearch = document.getElementById('movie-search');
const tvSearch = document.getElementById('tv-search');
const watchLaterSearch = document.getElementById('watch-later-search');
const movieGenreFilter = document.getElementById('movie-genre-filter');
const movieYearFilter = document.getElementById('movie-year-filter');
const movieWatchedFilter = document.getElementById('movie-watched-filter');
const tvGenreFilter = document.getElementById('tv-genre-filter');
const tvYearFilter = document.getElementById('tv-year-filter');
const watchLaterTypeFilter = document.getElementById('watch-later-type-filter');
const omdbSearch = document.getElementById('omdb-search');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const exportDataBtn = document.getElementById('export-data-btn');
const importDataBtn = document.getElementById('import-data-btn');
const importFile = document.getElementById('import-file');
const themeButtons = document.querySelectorAll('.theme-btn');
const toast = document.getElementById('toast');

// State
let movies = [];
let tvShows = [];
let currentMovieId = null;
let currentTvShowId = null;
let movieGenres = new Set();
let movieYears = new Set();
let tvGenres = new Set();
let tvYears = new Set();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load theme preference
    loadTheme();
    
    // Load data
    fetchMovies();
    fetchTvShows();
    
    // Set up event listeners
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            const sectionId = link.getAttribute('data-section');
            
            // Update active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show active section
            sections.forEach(section => {
                section.classList.remove('active-section');
                if (section.id === sectionId) {
                    section.classList.add('active-section');
                }
            });
        });
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Theme buttons
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const theme = btn.getAttribute('data-theme');
            if (theme === 'light') {
                document.body.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
            } else if (theme === 'dark') {
                document.body.classList.remove('light-theme');
                localStorage.setItem('theme', 'dark');
            } else if (theme === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    document.body.classList.remove('light-theme');
                } else {
                    document.body.classList.add('light-theme');
                }
                localStorage.setItem('theme', 'system');
            }
        });
    });
    
    // Add movie button
    addMovieBtn.addEventListener('click', () => {
        resetMovieForm();
        document.getElementById('movie-modal-title').textContent = 'Add Movie';
        movieModal.style.display = 'flex';
    });
    
    // Add TV show button
    addTvBtn.addEventListener('click', () => {
        resetTvForm();
        document.getElementById('tv-modal-title').textContent = 'Add TV Show';
        tvModal.style.display = 'flex';
    });
    
    // Close modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            movieModal.style.display = 'none';
            tvModal.style.display = 'none';
            tvDetailsModal.style.display = 'none';
            movieDetailsModal.style.display = 'none';
        });
    });
    
    // Cancel buttons
    document.getElementById('movie-cancel-btn').addEventListener('click', () => {
        movieModal.style.display = 'none';
    });
    
    document.getElementById('tv-cancel-btn').addEventListener('click', () => {
        tvModal.style.display = 'none';
    });
    
    // Form submissions
    movieForm.addEventListener('submit', handleMovieFormSubmit);
    tvForm.addEventListener('submit', handleTvFormSubmit);
    
    // Search and filters
    movieSearch.addEventListener('input', filterMovies);
    tvSearch.addEventListener('input', filterTvShows);
    watchLaterSearch.addEventListener('input', filterWatchLater);
    
    movieGenreFilter.addEventListener('change', filterMovies);
    movieYearFilter.addEventListener('change', filterMovies);
    movieWatchedFilter.addEventListener('change', filterMovies);
    
    tvGenreFilter.addEventListener('change', filterTvShows);
    tvYearFilter.addEventListener('change', filterTvShows);
    
    watchLaterTypeFilter.addEventListener('change', filterWatchLater);
    
    // OMDB Search
    searchBtn.addEventListener('click', searchOMDB);
    
    // Export/Import data
    exportDataBtn.addEventListener('click', exportData);
    importDataBtn.addEventListener('click', () => {
        importFile.click();
    });
    
    importFile.addEventListener('change', importData);
    
    // Movie details actions
    document.getElementById('movie-toggle-watched-btn').addEventListener('click', toggleMovieWatched);
    document.getElementById('movie-edit-btn').addEventListener('click', editMovie);
    document.getElementById('movie-delete-btn').addEventListener('click', deleteMovie);
}

// Theme Functions
function loadTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
        document.querySelector('.theme-btn[data-theme="light"]').classList.add('active');
        document.querySelector('.theme-btn[data-theme="dark"]').classList.remove('active');
    } else if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (!prefersDark) {
            document.body.classList.add('light-theme');
            themeToggle.classList.remove('fa-moon');
            themeToggle.classList.add('fa-sun');
        }
        document.querySelector('.theme-btn[data-theme="system"]').classList.add('active');
        document.querySelector('.theme-btn[data-theme="dark"]').classList.remove('active');
    }
}

function toggleTheme() {
    if (document.body.classList.contains('light-theme')) {
        document.body.classList.remove('light-theme');
        themeToggle.classList.remove('fa-sun');
        themeToggle.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
        document.querySelector('.theme-btn[data-theme="dark"]').classList.add('active');
        document.querySelector('.theme-btn[data-theme="light"]').classList.remove('active');
        document.querySelector('.theme-btn[data-theme="system"]').classList.remove('active');
    } else {
        document.body.classList.add('light-theme');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
        document.querySelector('.theme-btn[data-theme="light"]').classList.add('active');
        document.querySelector('.theme-btn[data-theme="dark"]').classList.remove('active');
        document.querySelector('.theme-btn[data-theme="system"]').classList.remove('active');
    }
}

// API Functions
async function fetchMovies() {
    try {
        const response = await fetch('/api/movies');
        movies = await response.json();
        
        // Extract genres and years
        movieGenres = new Set();
        movieYears = new Set();
        
        movies.forEach(movie => {
            if (movie.genre) {
                movie.genre.split(',').forEach(genre => {
                    movieGenres.add(genre.trim());
                });
            }
            if (movie.year) {
                movieYears.add(movie.year);
            }
        });
        
        // Populate filters
        populateMovieFilters();
        
        // Render movies
        renderMovies();
        
        // Update dashboard
        updateDashboard();
        
        // Render watch later
        renderWatchLater();
    } catch (error) {
        console.error('Error fetching movies:', error);
        showToast('Failed to load movies', 'error');
    }
}

async function fetchTvShows() {
    try {
        const response = await fetch('/api/tv');
        tvShows = await response.json();
        
        // Extract genres and years
        tvGenres = new Set();
        tvYears = new Set();
        
        tvShows.forEach(show => {
            if (show.genre) {
                show.genre.split(',').forEach(genre => {
                    tvGenres.add(genre.trim());
                });
            }
            if (show.year) {
                tvYears.add(show.year);
            }
        });
        
        // Populate filters
        populateTvFilters();
        
        // Render TV shows
        renderTvShows();
        
        // Update dashboard
        updateDashboard();
        
        // Render watch later
        renderWatchLater();
    } catch (error) {
        console.error('Error fetching TV shows:', error);
        showToast('Failed to load TV shows', 'error');
    }
}

async function addMovie(movieData) {
    try {
        const response = await fetch('/api/movies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add movie');
        }
        
        const newMovie = await response.json();
        movies.push(newMovie);
        
        // Update filters
        if (newMovie.genre) {
            newMovie.genre.split(',').forEach(genre => {
                movieGenres.add(genre.trim());
            });
        }
        if (newMovie.year) {
            movieYears.add(newMovie.year);
        }
        
        populateMovieFilters();
        
        // Re-render
        renderMovies();
        updateDashboard();
        renderWatchLater();
        
        showToast('Movie added successfully');
    } catch (error) {
        console.error('Error adding movie:', error);
        showToast(error.message, 'error');
    }
}

async function updateMovie(movieId, movieData) {
    try {
        const response = await fetch(`/api/movies/${movieId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update movie');
        }
        
        const updatedMovie = await response.json();
        
        // Update local data
        const index = movies.findIndex(m => m.id === movieId);
        if (index !== -1) {
            movies[index] = updatedMovie;
        }
        
        // Re-extract genres and years
        movieGenres = new Set();
        movieYears = new Set();
        
        movies.forEach(movie => {
            if (movie.genre) {
                movie.genre.split(',').forEach(genre => {
                    movieGenres.add(genre.trim());
                });
            }
            if (movie.year) {
                movieYears.add(movie.year);
            }
        });
        
        populateMovieFilters();
        
        // Re-render
        renderMovies();
        updateDashboard();
        renderWatchLater();
        
        showToast('Movie updated successfully');
    } catch (error) {
        console.error('Error updating movie:', error);
        showToast(error.message, 'error');
    }
}

async function deleteMovie() {
    if (!currentMovieId) return;
    
    if (!confirm('Are you sure you want to delete this movie?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/movies/${currentMovieId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete movie');
        }
        
        // Update local data
        movies = movies.filter(m => m.id !== currentMovieId);
        
        // Re-extract genres and years
        movieGenres = new Set();
        movieYears = new Set();
        
        movies.forEach(movie => {
            if (movie.genre) {
                movie.genre.split(',').forEach(genre => {
                    movieGenres.add(genre.trim());
                });
            }
            if (movie.year) {
                movieYears.add(movie.year);
            }
        });
        
        populateMovieFilters();
        
        // Close modal
        movieDetailsModal.style.display = 'none';
        
        // Re-render
        renderMovies();
        updateDashboard();
        renderWatchLater();
        
        showToast('Movie deleted successfully');
    } catch (error) {
        console.error('Error deleting movie:', error);
        showToast(error.message, 'error');
    }
}

async function addTvShow(tvData) {
    try {
        const response = await fetch('/api/tv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tvData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add TV show');
        }
        
        const newTvShow = await response.json();
        tvShows.push(newTvShow);
        
        // Update filters
        if (newTvShow.genre) {
            newTvShow.genre.split(',').forEach(genre => {
                tvGenres.add(genre.trim());
            });
        }
        if (newTvShow.year) {
            tvYears.add(newTvShow.year);
        }
        
        populateTvFilters();
        
        // Re-render
        renderTvShows();
        updateDashboard();
        renderWatchLater();
        
        showToast('TV show added successfully');
    } catch (error) {
        console.error('Error adding TV show:', error);
        showToast(error.message, 'error');
    }
}

async function updateTvShow(tvId, tvData) {
    try {
        const response = await fetch(`/api/tv/${tvId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tvData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update TV show');
        }
        
        const updatedTvShow = await response.json();
        
        // Update local data
        const index = tvShows.findIndex(t => t.id === tvId);
        if (index !== -1) {
            tvShows[index] = updatedTvShow;
        }
        
        // Re-extract genres and years
        tvGenres = new Set();
        tvYears = new Set();
        
        tvShows.forEach(show => {
            if (show.genre) {
                show.genre.split(',').forEach(genre => {
                    tvGenres.add(genre.trim());
                });
            }
            if (show.year) {
                tvYears.add(show.year);
            }
        });
        
        populateTvFilters();
        
        // Re-render
        renderTvShows();
        updateDashboard();
        renderWatchLater();
        
        showToast('TV show updated successfully');
    } catch (error) {
        console.error('Error updating TV show:', error);
        showToast(error.message, 'error');
    }
}

async function updateEpisode(tvId, episodeId, episodeData) {
    try {
        const response = await fetch(`/api/tv/${tvId}/episodes/${episodeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(episodeData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update episode');
        }
        
        // Fetch updated TV show
        const tvResponse = await fetch(`/api/tv/${tvId}`);
        const updatedTvShow = await tvResponse.json();
        
        // Update local data
        const index = tvShows.findIndex(t => t.id === tvId);
        if (index !== -1) {
            tvShows[index] = updatedTvShow;
        }
        
        // Re-render
        renderTvShows();
        updateDashboard();
        
        // If TV details modal is open, update it
        if (currentTvShowId === tvId && tvDetailsModal.style.display === 'flex') {
            renderTvShowDetails(tvId);
        }
        
        showToast('Episode updated successfully');
    } catch (error) {
        console.error('Error updating episode:', error);
        showToast(error.message, 'error');
    }
}

async function deleteTvShow(tvId) {
    if (!confirm('Are you sure you want to delete this TV show?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tv/${tvId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete TV show');
        }
        
        // Update local data
        tvShows = tvShows.filter(t => t.id !== tvId);
        
        // Re-extract genres and years
        tvGenres = new Set();
        tvYears = new Set();
        
        tvShows.forEach(show => {
            if (show.genre) {
                show.genre.split(',').forEach(genre => {
                    tvGenres.add(genre.trim());
                });
            }
            if (show.year) {
                tvYears.add(show.year);
            }
        });
        
        populateTvFilters();
        
        // Close modal if open
        tvDetailsModal.style.display = 'none';
        
        // Re-render
        renderTvShows();
        updateDashboard();
        renderWatchLater();
        
        showToast('TV show deleted successfully');
    } catch (error) {
        console.error('Error deleting TV show:', error);
        showToast(error.message, 'error');
    }
}

async function searchOMDB() {
    const query = omdbSearch.value.trim();
    if (!query) return;
    
    const searchType = document.querySelector('input[name="search-type"]:checked').value;
    
    try {
        searchResults.innerHTML = '<p class="loading">Searching...</p>';
        
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&type=${searchType}`);
        const data = await response.json();
        
        if (data.Error) {
            searchResults.innerHTML = `<p class="no-results">No results found: ${data.Error}</p>`;
            return;
        }
        
        renderSearchResults(data.Search);
    } catch (error) {
        console.error('Error searching OMDB:', error);
        searchResults.innerHTML = '<p class="error">Error searching. Please try again.</p>';
    }
}

// Render Functions
function renderMovies() {
    if (!movieGrid) return;
    
    // Apply filters
    const searchTerm = movieSearch.value.toLowerCase();
    const genreFilter = movieGenreFilter.value;
    const yearFilter = movieYearFilter.value ? parseInt(movieYearFilter.value) : null;
    const watchedFilter = movieWatchedFilter.value;
    
    const filteredMovies = movies.filter(movie => {
        // Search filter
        if (searchTerm && !movie.title.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Genre filter
        if (genreFilter && (!movie.genre || !movie.genre.toLowerCase().includes(genreFilter.toLowerCase()))) {
            return false;
        }
        
        // Year filter
        if (yearFilter && movie.year !== yearFilter) {
            return false;
        }
        
        // Watched filter
        if (watchedFilter === 'true' && !movie.watched) {
            return false;
        } else if (watchedFilter === 'false' && movie.watched) {
            return false;
        }
        
        return true;
    });
    
    // Sort by title
    filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
    
    // Render
    movieGrid.innerHTML = '';
    
    if (filteredMovies.length === 0) {
        movieGrid.innerHTML = '<p class="no-results">No movies found</p>';
        return;
    }
    
    filteredMovies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'media-card';
        card.dataset.id = movie.id;
        
        const posterUrl = movie.poster_url && movie.poster_url !== 'N/A' 
            ? movie.poster_url 
            : 'https://via.placeholder.com/300x450?text=No+Poster';
        
        card.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title}">
            <div class="media-info">
                <h3 class="media-title">${movie.title}</h3>
                <div class="media-meta">
                    <span>${movie.year || 'Unknown'}</span>
                    <span>${movie.rating ? `★ ${movie.rating}` : ''}</span>
                </div>
            </div>
            ${movie.watched ? '<div class="media-badge">Watched</div>' : ''}
        `;
        
        card.addEventListener('click', () => {
            showMovieDetails(movie.id);
        });
        
        movieGrid.appendChild(card);
    });
}

function renderTvShows() {
    if (!tvShowsGrid) return;
    
    // Apply filters
    const searchTerm = tvSearch.value.toLowerCase();
    const genreFilter = tvGenreFilter.value;
    const yearFilter = tvYearFilter.value ? parseInt(tvYearFilter.value) : null;
    
    const filteredTvShows = tvShows.filter(show => {
        // Search filter
        if (searchTerm && !show.title.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Genre filter
        if (genreFilter && (!show.genre || !show.genre.toLowerCase().includes(genreFilter.toLowerCase()))) {
            return false;
        }
        
        // Year filter
        if (yearFilter && show.year !== yearFilter) {
            return false;
        }
        
        return true;
    });
    
    // Sort by title
    filteredTvShows.sort((a, b) => a.title.localeCompare(b.title));
    
    // Render
    tvShowsGrid.innerHTML = '';
    
    if (filteredTvShows.length === 0) {
        tvShowsGrid.innerHTML = '<p class="no-results">No TV shows found</p>';
        return;
    }
    
    filteredTvShows.forEach(show => {
        const card = document.createElement('div');
        card.className = 'media-card';
        card.dataset.id = show.id;
        
        const posterUrl = show.poster_url && show.poster_url !== 'N/A' 
            ? show.poster_url 
            : 'https://via.placeholder.com/300x450?text=No+Poster';
        
        card.innerHTML = `
            <img src="${posterUrl}" alt="${show.title}">
            <div class="media-info">
                <h3 class="media-title">${show.title}</h3>
                <div class="media-meta">
                    <span>${show.year || 'Unknown'}</span>
                    <span>${show.rating ? `★ ${show.rating}` : ''}</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${show.progress}%"></div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            showTvShowDetails(show.id);
        });
        
        tvShowsGrid.appendChild(card);
    });
}

function renderWatchLater() {
    if (!watchLaterGrid) return;
    
    // Get all watch later items
    const watchLaterMovies = movies.filter(movie => movie.watch_later);
    const watchLaterTvShows = tvShows.filter(show => show.watch_later);
    
    // Apply filters
    const searchTerm = watchLaterSearch.value.toLowerCase();
    const typeFilter = watchLaterTypeFilter.value;
    
    let filteredItems = [];
    
    if (typeFilter === '' || typeFilter === 'movie') {
        filteredItems = filteredItems.concat(
            watchLaterMovies.filter(movie => 
                !searchTerm || movie.title.toLowerCase().includes(searchTerm)
            ).map(movie => ({...movie, type: 'movie'}))
        );
    }
    
    if (typeFilter === '' || typeFilter === 'tv') {
        filteredItems = filteredItems.concat(
            watchLaterTvShows.filter(show => 
                !searchTerm || show.title.toLowerCase().includes(searchTerm)
            ).map(show => ({...show, type: 'tv'}))
        );
    }
    
    // Sort by title
    filteredItems.sort((a, b) => a.title.localeCompare(b.title));
    
    // Render
    watchLaterGrid.innerHTML = '';
    
    if (filteredItems.length === 0) {
        watchLaterGrid.innerHTML = '<p class="no-results">No items in watch later list</p>';
        return;
    }
    
    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'media-card';
        card.dataset.id = item.id;
        card.dataset.type = item.type;
        
        const posterUrl = item.poster_url && item.poster_url !== 'N/A' 
            ? item.poster_url 
            : 'https://via.placeholder.com/300x450?text=No+Poster';
        
        card.innerHTML = `
            <img src="${posterUrl}" alt="${item.title}">
            <div class="media-info">
                <h3 class="media-title">${item.title}</h3>
                <div class="media-meta">
                    <span>${item.year || 'Unknown'}</span>
                    <span>${item.type === 'movie' ? 'Movie' : 'TV Show'}</span>
                </div>
            </div>
            ${item.type === 'tv' && item.total_episodes > 0 ? `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${item.progress}%"></div>
                </div>
            ` : ''}
        `;
        
        card.addEventListener('click', () => {
            if (item.type === 'movie') {
                showMovieDetails(item.id);
            } else {
                showTvShowDetails(item.id);
            }
        });
        
        watchLaterGrid.appendChild(card);
    });
}

function renderSearchResults(results) {
    searchResults.innerHTML = '';
    
    if (!results || results.length === 0) {
        searchResults.innerHTML = '<p class="no-results">No results found</p>';
        return;
    }
    
    results.forEach(item => {
        const card = document.createElement('div');
        card.className = 'media-card';
        card.dataset.imdbId = item.imdbID;
        card.dataset.type = item.Type;
        
        const posterUrl = item.Poster && item.Poster !== 'N/A' 
            ? item.Poster 
            : 'https://via.placeholder.com/300x450?text=No+Poster';
        
        card.innerHTML = `
            <img src="${posterUrl}" alt="${item.Title}">
            <div class="media-info">
                <h3 class="media-title">${item.Title}</h3>
                <div class="media-meta">
                    <span>${item.Year || 'Unknown'}</span>
                    <span>${item.Type === 'movie' ? 'Movie' : 'TV Show'}</span>
                </div>
            </div>
            <button class="add-to-collection-btn primary-btn">
                <i class="fas fa-plus"></i> Add
            </button>
        `;
        
        // Add to collection button
        const addBtn = card.querySelector('.add-to-collection-btn');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCollection(item);
        });
        
        // Show details on card click
        card.addEventListener('click', async () => {
            try {
                const response = await fetch(`/api/details/${item.imdbID}`);
                const details = await response.json();
                
                if (details.Error) {
                    showToast(details.Error, 'error');
                    return;
                }
                
                // Show details in a modal
                showOMDBDetails(details);
            } catch (error) {
                console.error('Error fetching details:', error);
                showToast('Failed to load details', 'error');
            }
        });
        
        searchResults.appendChild(card);
    });
}

function showOMDBDetails(details) {
    // Create a modal to show details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content glass-panel';
    
    const posterUrl = details.Poster && details.Poster !== 'N/A' 
        ? details.Poster 
        : 'https://via.placeholder.com/300x450?text=No+Poster';
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${details.Title} (${details.Year})</h2>
            <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <div class="movie-details-container">
                <div class="movie-poster">
                    <img src="${posterUrl}" alt="${details.Title}">
                </div>
                <div class="movie-metadata">
                    <p><strong>Genre:</strong> ${details.Genre}</p>
                    <p><strong>Director:</strong> ${details.Director}</p>
                    <p><strong>Actors:</strong> ${details.Actors}</p>
                    <p><strong>Plot:</strong> ${details.Plot}</p>
                    <p><strong>IMDb Rating:</strong> ${details.imdbRating}</p>
                    <div class="movie-actions">
                        <button class="primary-btn add-to-collection-btn">
                            <i class="fas fa-plus"></i> Add to Collection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Close button
    const closeBtn = modalContent.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Add to collection button
    const addBtn = modalContent.querySelector('.add-to-collection-btn');
    addBtn.addEventListener('click', () => {
        addToCollection(details);
        document.body.removeChild(modal);
    });
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function addToCollection(item) {
    // Check if it's a movie or TV show
    const type = item.Type || (item.totalSeasons ? 'series' : 'movie');
    
    if (type === 'movie') {
        // Check if movie already exists
        const existingMovie = movies.find(m => m.imdb_id === item.imdbID);
        if (existingMovie) {
            showToast('Movie already in your collection', 'info');
            return;
        }
        
        // Prepare movie data
        const movieData = {
            title: item.Title,
            year: parseInt(item.Year),
            genre: item.Genre,
            director: item.Director,
            poster_url: item.Poster,
            plot: item.Plot,
            imdb_id: item.imdbID,
            rating: item.imdbRating ? parseFloat(item.imdbRating) : null,
            watched: false,
            watch_later: true
        };
        
        // Add movie
        addMovie(movieData);
    } else if (type === 'series') {
        // Check if TV show already exists
        const existingShow = tvShows.find(s => s.imdb_id === item.imdbID);
        if (existingShow) {
            showToast('TV show already in your collection', 'info');
            return;
        }
        
        // Prepare TV show data
        const tvData = {
            title: item.Title,
            year: parseInt(item.Year),
            genre: item.Genre,
            creator: item.Writer,
            poster_url: item.Poster,
            plot: item.Plot,
            imdb_id: item.imdbID,
            total_episodes: item.totalSeasons ? parseInt(item.totalSeasons) * 10 : 10, // Estimate
            rating: item.imdbRating ? parseFloat(item.imdbRating) : null,
            watch_later: true
        };
        
        // Add TV show
        addTvShow(tvData);
    }
}

function updateDashboard() {
    // Update counts
    document.getElementById('movie-count').textContent = movies.length;
    document.getElementById('tv-count').textContent = tvShows.length;
    
    const watchedMovies = movies.filter(movie => movie.watched).length;
    const watchedEpisodes = tvShows.reduce((total, show) => {
        return total + show.episodes.filter(episode => episode.watched).length;
    }, 0);
    document.getElementById('watched-count').textContent = watchedMovies + watchedEpisodes;
    
    const watchLaterCount = movies.filter(movie => movie.watch_later).length + 
                           tvShows.filter(show => show.watch_later).length;
    document.getElementById('watch-later-count').textContent = watchLaterCount;
    
    // Render recent items
    if (recentItemsGrid) {
        // Combine movies and TV shows, sort by created_at
        const allItems = [
            ...movies.map(movie => ({...movie, type: 'movie'})),
            ...tvShows.map(show => ({...show, type: 'tv'}))
        ];
        
        // Sort by created_at (newest first)
        allItems.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA;
        });
        
        // Take the 6 most recent items
        const recentItems = allItems.slice(0, 6);
        
        recentItemsGrid.innerHTML = '';
        
        if (recentItems.length === 0) {
            recentItemsGrid.innerHTML = '<p class="no-results">No items in your collection</p>';
            return;
        }
        
        recentItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'media-card';
            card.dataset.id = item.id;
            card.dataset.type = item.type;
            
            const posterUrl = item.poster_url && item.poster_url !== 'N/A' 
                ? item.poster_url 
                : 'https://via.placeholder.com/300x450?text=No+Poster';
            
            card.innerHTML = `
                <img src="${posterUrl}" alt="${item.title}">
                <div class="media-info">
                    <h3 class="media-title">${item.title}</h3>
                    <div class="media-meta">
                        <span>${item.year || 'Unknown'}</span>
                        <span>${item.type === 'movie' ? 'Movie' : 'TV Show'}</span>
                    </div>
                </div>
                ${item.type === 'movie' && item.watched ? '<div class="media-badge">Watched</div>' : ''}
                ${item.type === 'tv' && item.total_episodes > 0 ? `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${item.progress}%"></div>
                    </div>
                ` : ''}
            `;
            
            card.addEventListener('click', () => {
                if (item.type === 'movie') {
                    showMovieDetails(item.id);
                } else {
                    showTvShowDetails(item.id);
                }
            });
            
            recentItemsGrid.appendChild(card);
        });
    }
}

// Filter Functions
function populateMovieFilters() {
    // Genres
    movieGenreFilter.innerHTML = '<option value="">All Genres</option>';
    [...movieGenres].sort().forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        movieGenreFilter.appendChild(option);
    });
    
    // Years
    movieYearFilter.innerHTML = '<option value="">All Years</option>';
    [...movieYears].sort((a, b) => b - a).forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        movieYearFilter.appendChild(option);
    });
}

function populateTvFilters() {
    // Genres
    tvGenreFilter.innerHTML = '<option value="">All Genres</option>';
    [...tvGenres].sort().forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        tvGenreFilter.appendChild(option);
    });
    
    // Years
    tvYearFilter.innerHTML = '<option value="">All Years</option>';
    [...tvYears].sort((a, b) => b - a).forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        tvYearFilter.appendChild(option);
    });
}

function filterMovies() {
    renderMovies();
}

function filterTvShows() {
    renderTvShows();
}

function filterWatchLater() {
    renderWatchLater();
}

// Form Handling
function resetMovieForm() {
    document.getElementById('movie-id').value = '';
    document.getElementById('movie-imdb-id').value = '';
    document.getElementById('movie-title').value = '';
    document.getElementById('movie-year').value = '';
    document.getElementById('movie-genre').value = '';
    document.getElementById('movie-director').value = '';
    document.getElementById('movie-poster').value = '';
    document.getElementById('movie-plot').value = '';
    document.getElementById('movie-rating').value = '';
    document.getElementById('movie-watched').checked = false;
    document.getElementById('movie-watch-later').checked = false;
    document.getElementById('movie-notes').value = '';
}

function resetTvForm() {
    document.getElementById('tv-id').value = '';
    document.getElementById('tv-imdb-id').value = '';
    document.getElementById('tv-title').value = '';
    document.getElementById('tv-year').value = '';
    document.getElementById('tv-genre').value = '';
    document.getElementById('tv-creator').value = '';
    document.getElementById('tv-poster').value = '';
    document.getElementById('tv-plot').value = '';
    document.getElementById('tv-total-episodes').value = '';
    document.getElementById('tv-rating').value = '';
    document.getElementById('tv-watch-later').checked = false;
    document.getElementById('tv-notes').value = '';
}

function handleMovieFormSubmit(e) {
    e.preventDefault();
    
    const movieId = document.getElementById('movie-id').value;
    const movieData = {
        title: document.getElementById('movie-title').value,
        year: document.getElementById('movie-year').value ? parseInt(document.getElementById('movie-year').value) : null,
        genre: document.getElementById('movie-genre').value,
        director: document.getElementById('movie-director').value,
        poster_url: document.getElementById('movie-poster').value,
        plot: document.getElementById('movie-plot').value,
        imdb_id: document.getElementById('movie-imdb-id').value,
        rating: document.getElementById('movie-rating').value ? parseFloat(document.getElementById('movie-rating').value) : null,
        watched: document.getElementById('movie-watched').checked,
        watch_later: document.getElementById('movie-watch-later').checked,
        notes: document.getElementById('movie-notes').value
    };
    
    if (movieId) {
        // Update existing movie
        updateMovie(parseInt(movieId), movieData);
    } else {
        // Add new movie
        addMovie(movieData);
    }
    
    // Close modal
    movieModal.style.display = 'none';
}

function handleTvFormSubmit(e) {
    e.preventDefault();
    
    const tvId = document.getElementById('tv-id').value;
    const tvData = {
        title: document.getElementById('tv-title').value,
        year: document.getElementById('tv-year').value ? parseInt(document.getElementById('tv-year').value) : null,
        genre: document.getElementById('tv-genre').value,
        creator: document.getElementById('tv-creator').value,
        poster_url: document.getElementById('tv-poster').value,
        plot: document.getElementById('tv-plot').value,
        imdb_id: document.getElementById('tv-imdb-id').value,
        total_episodes: parseInt(document.getElementById('tv-total-episodes').value) || 0,
        rating: document.getElementById('tv-rating').value ? parseFloat(document.getElementById('tv-rating').value) : null,
        watch_later: document.getElementById('tv-watch-later').checked,
        notes: document.getElementById('tv-notes').value
    };
    
    if (tvId) {
        // Update existing TV show
        updateTvShow(parseInt(tvId), tvData);
    } else {
        // Add new TV show
        addTvShow(tvData);
    }
    
    // Close modal
    tvModal.style.display = 'none';
}

// Detail Views
function showMovieDetails(movieId) {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;
    
    currentMovieId = movieId;
    
    // Populate movie details
    document.getElementById('movie-details-title-text').textContent = movie.title;
    document.getElementById('movie-details-year').textContent = movie.year || 'Unknown';
    document.getElementById('movie-details-genre').textContent = movie.genre || 'Unknown';
    document.getElementById('movie-details-director').textContent = movie.director || 'Unknown';
    document.getElementById('movie-details-rating').textContent = movie.rating || 'Not rated';
    document.getElementById('movie-details-plot').textContent = movie.plot || 'No plot available';
    document.getElementById('movie-details-notes').textContent = movie.notes || 'No notes';
    
    const posterUrl = movie.poster_url && movie.poster_url !== 'N/A' 
        ? movie.poster_url 
        : 'https://via.placeholder.com/300x450?text=No+Poster';
    document.getElementById('movie-details-poster').src = posterUrl;
    
    // Show/hide watched badge
    const watchedBadge = document.getElementById('movie-watched-badge');
    if (movie.watched) {
        watchedBadge.style.display = 'block';
    } else {
        watchedBadge.style.display = 'none';
    }
    
    // Update watched button text
    const watchedBtn = document.getElementById('movie-toggle-watched-btn');
    if (movie.watched) {
        watchedBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Mark as Unwatched';
    } else {
        watchedBtn.innerHTML = '<i class="fas fa-eye"></i> Mark as Watched';
    }
    
    // Show modal
    movieDetailsModal.style.display = 'flex';
}

function showTvShowDetails(tvId) {
    const tvShow = tvShows.find(t => t.id === tvId);
    if (!tvShow) return;
    
    currentTvShowId = tvId;
    
    renderTvShowDetails(tvId);
    
    // Show modal
    tvDetailsModal.style.display = 'flex';
}

function renderTvShowDetails(tvId) {
    const tvShow = tvShows.find(t => t.id === tvId);
    if (!tvShow) return;
    
    // Populate TV show details
    document.getElementById('tv-details-title-text').textContent = tvShow.title;
    document.getElementById('tv-details-year').textContent = tvShow.year || 'Unknown';
    document.getElementById('tv-details-genre').textContent = tvShow.genre || 'Unknown';
    document.getElementById('tv-details-creator').textContent = tvShow.creator || 'Unknown';
    document.getElementById('tv-details-progress').textContent = `${tvShow.watched_episodes}/${tvShow.total_episodes} episodes`;
    document.getElementById('tv-details-rating').textContent = tvShow.rating || 'Not rated';
    document.getElementById('tv-details-notes').textContent = tvShow.notes || 'No notes';
    
    // Update progress bar
    document.getElementById('tv-details-progress-bar').style.width = `${tvShow.progress}%`;
    
    const posterUrl = tvShow.poster_url && tvShow.poster_url !== 'N/A' 
        ? tvShow.poster_url 
        : 'https://via.placeholder.com/300x450?text=No+Poster';
    document.getElementById('tv-details-poster').src = posterUrl;
    
    // Render episodes
    const episodesList = document.getElementById('episodes-list');
    episodesList.innerHTML = '';
    
    if (tvShow.episodes.length === 0) {
        episodesList.innerHTML = '<p class="no-results">No episodes available</p>';
        return;
    }
    
    // Sort episodes by season and episode number
    const sortedEpisodes = [...tvShow.episodes].sort((a, b) => {
        if (a.season !== b.season) {
            return a.season - b.season;
        }
        return a.episode_number - b.episode_number;
    });
    
    sortedEpisodes.forEach(episode => {
        const episodeItem = document.createElement('div');
        episodeItem.className = `episode-item ${episode.watched ? 'watched' : ''}`;
        episodeItem.dataset.id = episode.id;
        
        episodeItem.innerHTML = `
            <div class="episode-title">${episode.title || `Episode ${episode.episode_number}`}</div>
            <div class="episode-number">S${episode.season} E${episode.episode_number}</div>
            <div class="episode-watched">
                <input type="checkbox" id="episode-${episode.id}" ${episode.watched ? 'checked' : ''}>
                <label for="episode-${episode.id}">Watched</label>
            </div>
        `;
        
        // Add event listener to checkbox
        const checkbox = episodeItem.querySelector(`#episode-${episode.id}`);
        checkbox.addEventListener('change', () => {
            updateEpisode(tvShow.id, episode.id, {
                watched: checkbox.checked
            });
        });
        
        episodesList.appendChild(episodeItem);
    });
}

function editMovie() {
    const movie = movies.find(m => m.id === currentMovieId);
    if (!movie) return;
    
    // Populate form
    document.getElementById('movie-id').value = movie.id;
    document.getElementById('movie-imdb-id').value = movie.imdb_id || '';
    document.getElementById('movie-title').value = movie.title || '';
    document.getElementById('movie-year').value = movie.year || '';
    document.getElementById('movie-genre').value = movie.genre || '';
    document.getElementById('movie-director').value = movie.director || '';
    document.getElementById('movie-poster').value = movie.poster_url || '';
    document.getElementById('movie-plot').value = movie.plot || '';
    document.getElementById('movie-rating').value = movie.rating || '';
    document.getElementById('movie-watched').checked = movie.watched || false;
    document.getElementById('movie-watch-later').checked = movie.watch_later || false;
    document.getElementById('movie-notes').value = movie.notes || '';
    
    // Update modal title
    document.getElementById('movie-modal-title').textContent = 'Edit Movie';
    
    // Close details modal and open edit modal
    movieDetailsModal.style.display = 'none';
    movieModal.style.display = 'flex';
}

function toggleMovieWatched() {
    const movie = movies.find(m => m.id === currentMovieId);
    if (!movie) return;
    
    updateMovie(currentMovieId, {
        watched: !movie.watched
    });
    
    // Update UI
    showMovieDetails(currentMovieId);
}

// Data Export/Import
function exportData() {
    const data = {
        movies,
        tvShows,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cinemate-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Data exported successfully');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.movies || !data.tvShows) {
                throw new Error('Invalid import file format');
            }
            
            // Confirm import
            if (!confirm(`Import ${data.movies.length} movies and ${data.tvShows.length} TV shows? This will replace your current collection.`)) {
                return;
            }
            
            // TODO: Implement proper import via API
            // For now, just replace the local data and refresh
            movies = data.movies;
            tvShows = data.tvShows;
            
            // Re-extract genres and years
            movieGenres = new Set();
            movieYears = new Set();
            tvGenres = new Set();
            tvYears = new Set();
            
            movies.forEach(movie => {
                if (movie.genre) {
                    movie.genre.split(',').forEach(genre => {
                        movieGenres.add(genre.trim());
                    });
                }
                if (movie.year) {
                    movieYears.add(movie.year);
                }
            });
            
            tvShows.forEach(show => {
                if (show.genre) {
                    show.genre.split(',').forEach(genre => {
                        tvGenres.add(genre.trim());
                    });
                }
                if (show.year) {
                    tvYears.add(show.year);
                }
            });
            
            // Update UI
            populateMovieFilters();
            populateTvFilters();
            renderMovies();
            renderTvShows();
            updateDashboard();
            renderWatchLater();
            
            showToast('Data imported successfully');
        } catch (error) {
            console.error('Import error:', error);
            showToast('Failed to import data: ' + error.message, 'error');
        }
        
        // Reset file input
        e.target.value = '';
    };
    
    reader.readAsText(file);
}

// Utility Functions
function showToast(message, type = 'success') {
    const toastIcon = document.querySelector('.toast-icon');
    const toastMessage = document.querySelector('.toast-message');
    
    // Set icon and color based on type
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle toast-icon';
        toastIcon.style.color = '#4caf50';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle toast-icon';
        toastIcon.style.color = '#f44336';
    } else if (type === 'info') {
        toastIcon.className = 'fas fa-info-circle toast-icon';
        toastIcon.style.color = '#2196f3';
    }
    
    toastMessage.textContent = message;
    
    // Show toast
    toast.style.display = 'block';
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}