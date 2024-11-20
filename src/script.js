function getAuthCode() {
	const params = new URLSearchParams(window.location.search);
	return params.get('code');
}

async function fetchAccessToken(code) {
	const clientId = 'ujYsW0qmZoP2vb-wfAYvnIo4E2XrgdJshrFLDHlA3bc';
	const clientSecret = '5QsboUM7c0cICG6STpfD4nRA0zUfew_PwyYlvwkKQd4';
	const redirectUri = 'http://localhost:8080/';

	const response = await fetch('https://unsplash.com/oauth/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri,
			code: code,
			grant_type: 'authorization_code'
		})
	});

	if (response.ok) {
		const data = await response.json();
		localStorage.setItem('accessToken', data.access_token);
		return data.access_token;
	} else {
		const errorData = await response.json();
		console.error('Error fetching access token', errorData);
	}
}

async function fetchPhotos(accessToken, query = '') {
	const url = query ? `https://api.unsplash.com/search/photos?query=${query}` : 'https://api.unsplash.com/photos';

	const response = await fetch(url, {
		headers: {
			'Authorization': `Bearer ${accessToken}`
		}
	});

	if (response.ok) {
		const data = await response.json();
		const photos = query ? data.results : data;
		displayPhotos(photos);
		loadFavorites();
	} else {
		console.error('Error fetching photos from Unsplash', response.status, response.statusText);
	}
}

function displayPhotos(photos) {
	const photosDiv = document.getElementById('photos');
	const photosHeader = document.getElementById('photos-header');
	if (photos.length > 0) {
		photosHeader.classList.remove('header');
		photosDiv.innerHTML = photos.map(photo => `
            <div style="position: relative; display: inline-block;">
                <img src="${photo.urls.small}" alt="${photo.description}" style="width: 200px; margin: 10px;">
                <svg class="heart" viewBox="0 0 24 24" onclick="toggleFavorite('${photo.id}', '${photo.urls.small}', '${photo.description}')">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </div>
        `).join('');
	} else {
		photosHeader.classList.add('header');
		photosDiv.innerHTML = '';
	}
}

function toggleFavorite(id, url, description) {
	let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
	const index = favorites.findIndex(photo => photo.id === id);

	if (index === -1) {
		favorites.push({ id, url, description });
	} else {
		favorites.splice(index, 1);
	}

	localStorage.setItem('favorites', JSON.stringify(favorites));
	loadFavorites();
}

function loadFavorites() {
	const favoritePhotosDiv = document.getElementById('favorite-photos');
	const favoritePhotosHeader = document.getElementById('favorite-photos-header');
	const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

	if (favorites.length > 0) {
		favoritePhotosHeader.classList.remove('header');
		favoritePhotosDiv.innerHTML = favorites.map(photo => `
            <div style="position: relative; display: inline-block;">
                <img src="${photo.url}" alt="${photo.description}" style="width: 200px; margin: 10px;">
                <svg class="heart filled" viewBox="0 0 24 24" onclick="toggleFavorite('${photo.id}', '${photo.url}', '${photo.description}')">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </div>
        `).join('');
	} else {
		favoritePhotosHeader.classList.add('header');
		favoritePhotosDiv.innerHTML = '';
	}

	document.querySelectorAll('.heart').forEach(svg => {
		const id = svg.getAttribute('onclick').match(/'([^']+)'/)[1];
		if (favorites.some(photo => photo.id === id)) {
			svg.classList.add('filled');
		} else {
			svg.classList.remove('filled');
		}
	});
}

function generateAuthLink() {
	const clientId = 'ujYsW0qmZoP2vb-wfAYvnIo4E2XrgdJshrFLDHlA3bc';
	const redirectUri = 'http://localhost:8080/';
	const authLinkDiv = document.getElementById('auth');
	authLinkDiv.innerHTML = `<button type="button" onClick="location.href='https://unsplash.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=public+write_collections';">Login</button>`;
}

function setupSearch(accessToken) {
	const searchForm = document.getElementById('search-form');
	searchForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		const query = document.getElementById('search-input').value;
		await fetchPhotos(accessToken, query);
	});
}

async function main() {
	const authLinkDiv = document.getElementById('auth');
	const searchContainer = document.getElementById('search-container');
	let accessToken = localStorage.getItem('accessToken');

	if (!accessToken) {
		const code = getAuthCode();
		if (code) {
			accessToken = await fetchAccessToken(code);
			localStorage.setItem('accessToken', accessToken);
		}
	}

	if (accessToken) {
		authLinkDiv.style.display = 'none';
		searchContainer.innerHTML = `
            <form id="search-form">
                <input type="text" id="search-input" placeholder="Search for photos">
                <button type="submit">Search</button>
            </form>
        `;
		setupSearch(accessToken);
		fetchPhotos(accessToken);
		loadFavorites();
	} else {
		authLinkDiv.style.display = 'block';
		searchContainer.innerHTML = '';
		generateAuthLink();
	}
}

document.addEventListener("DOMContentLoaded", function () {
	var favoritePhotosDiv = document.getElementById("favorite-photos");
	if (favoritePhotosDiv && favoritePhotosDiv.children.length > 0) {
		var br = document.createElement("br");
		favoritePhotosDiv.appendChild(br);
	}
});

document.addEventListener('DOMContentLoaded', main);