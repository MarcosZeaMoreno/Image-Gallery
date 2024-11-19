function getAuthCode() {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
}

async function fetchAccessToken(code) {
    const clientId = '';
    const clientSecret = '';
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
        console.error('Error fetching access token');
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
    } else {
        console.error('Error fetching photos from Unsplash');
    }
}

function displayPhotos(photos) {
    const photosDiv = document.getElementById('photos');
    photosDiv.innerHTML = photos.map(photo => `
        <img src="${photo.urls.small}" alt="${photo.description}" style="width: 200px; margin: 10px;">
    `).join('');
}

function generateAuthLink() {
    const clientId = '';
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
    } else {
        authLinkDiv.style.display = 'block';
        searchContainer.innerHTML = '';
        generateAuthLink();
    }
}

main();