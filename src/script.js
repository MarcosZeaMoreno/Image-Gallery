function getAuthCode() {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
}

async function fetchPhotos(code) {
    const clientId = '';

    const url = `https://api.unsplash.com/photos?client_id=${clientId}&code=${code}`; // Usar el código para obtener imágenes

    const response = await fetch(url);
    if (response.ok) {
        const photos = await response.json();
        displayPhotos(photos);
    } else {
        console.error('Error al obtener fotos de Unsplash');
    }
}

function displayPhotos(photos) {
    const photosDiv = document.getElementById('photos');
    photosDiv.innerHTML = photos.map(photo => `
        <img src="${photo.urls.small}" alt="${photo.description}" style="width: 200px; margin: 10px;">
    `).join('');
}

function generateAuthLink() {
    const authLinkDiv = document.getElementById('auth');
    authLinkDiv.innerHTML = `<button type="button" onClick="location.href='https://unsplash.com/oauth/authorize?client_id=ujYsW0qmZoP2vb-wfAYvnIo4E2XrgdJshrFLDHlA3bc&redirect_uri=http://localhost:8080/&response_type=code&scope=public+write_collections';">Login</button>`;
}

function main() {
    const code = getAuthCode();
    
    if (code) {
        fetchPhotos(code);
    } else {
        generateAuthLink();
    }
}

main();