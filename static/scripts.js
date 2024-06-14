document.addEventListener('DOMContentLoaded', () => {
    let playlists = [];

    fetch('/api/playlists')
        .then((response) => response.json())
        .then((data) => {
            playlists = data.playlists;
            displayPlaylists(playlists);
            addEventListeners();
            updatePlaylistCount();
        })
        .catch((error) => console.error('Error fetching playlists:', error));

    document.getElementById('addPlaylistForm').addEventListener('submit', (event) => {
        event.preventDefault();

        const newPlaylist = {
            game: event.target.game.value,
            video_number: event.target.video_number.value || 1,
            youtuber: event.target.youtuber.value,
            link: event.target.link.value,
        };

        fetch('/api/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPlaylist),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    playlists.push(newPlaylist);
                    displayPlaylists(playlists);
                    addEventListeners();
                    clearForm();
                    updatePlaylistCount();
                }
            })
            .catch((error) => console.error('Error adding playlist:', error));
    });

    document.getElementById('search').addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const playlistDivs = document.querySelectorAll('.playlist');
        let visibleCount = 0;

        playlistDivs.forEach((div) => {
            const gameText = div.querySelector('p a').textContent.toLowerCase();
            const youtuberText = div.querySelector('p:nth-child(4)').textContent.toLowerCase();
            if (gameText.includes(query) || youtuberText.includes(query)) {
                div.style.display = 'flex';
                visibleCount++;
            } else {
                div.style.display = 'none';
            }
        });

        document.getElementById('total-playlists').textContent = visibleCount;
    });

    function displayPlaylists(playlists) {
        const playlistsDiv = document.getElementById('playlists');
        playlistsDiv.innerHTML = '';
        playlists.forEach((playlist, index) => {
            const playlistDiv = document.createElement('div');
            playlistDiv.className = 'playlist';
            playlistDiv.innerHTML = `
                <button class="delete-btn" data-index="${index}">X</button>
                <p><a href="${playlist.link}" target="_blank" class="playlist-link">${playlist.game}</a></p>
                <p> - #<span class="video-number" data-index="${index}">${playlist.video_number}</span></p>
                <p> (${playlist.youtuber})</p>
            `;
            playlistsDiv.appendChild(playlistDiv);
        });

        updatePlaylistCount();
    }

    function addEventListeners() {
        document.querySelectorAll('.video-number').forEach((element) => {
            element.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                const currentNumber = event.target.textContent;
                const input = document.createElement('input');
                input.type = 'number';
                input.value = currentNumber;
                input.step = 0.1;
                input.className = 'editable-input';
                input.addEventListener('blur', () => {
                    const newVideoNumber = input.value || 1;
                    updateVideoNumber(index, newVideoNumber);
                    event.target.textContent = newVideoNumber;
                    event.target.style.display = 'inline';
                    input.remove();
                });
                event.target.style.display = 'none';
                event.target.parentNode.insertBefore(input, event.target.nextSibling);
                input.focus();
            });
        });

        document.querySelectorAll('.delete-btn').forEach((button) => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                deletePlaylist(index, event.target.parentNode);
            });
        });
    }

    function clearForm() {
        document.getElementById('game').value = '';
        document.getElementById('video_number').value = 1;
        document.getElementById('youtuber').value = '';
        document.getElementById('link').value = '';
    }

    function updatePlaylistCount() {
        const totalPlaylists = document.querySelectorAll('.playlist').length;
        document.getElementById('total-playlists').textContent = totalPlaylists;
    }
});

function updateVideoNumber(index, newVideoNumber) {
    fetch(`/api/playlists/${index}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_number: newVideoNumber }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (!data.success) {
                console.error('Error updating video number:', data.error);
            }
        })
        .catch((error) => console.error('Error updating video number:', error));
}

function deletePlaylist(index, element) {
    fetch(`/api/playlists/${index}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                element.remove();
                updateIndices();
                updatePlaylistCount();
            } else {
                console.error('Error deleting playlist:', data.error);
            }
        })
        .catch((error) => console.error('Error deleting playlist:', error));
}

function updateIndices() {
    document.querySelectorAll('.playlist').forEach((playlistDiv, index) => {
        playlistDiv.querySelector('.delete-btn').setAttribute('data-index', index);
        playlistDiv.querySelector('.video-number').setAttribute('data-index', index);
    });
}
