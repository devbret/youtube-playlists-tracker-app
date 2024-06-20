document.addEventListener('DOMContentLoaded', () => {
    let playlists = [];
    let currentFilter = '';
    let debounceTimer;
    const colorMap = {};

    fetch('/api/playlists')
        .then((response) => response.json())
        .then((data) => {
            playlists = data.playlists;
            assignColors(playlists);
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
                    playlists.sort((a, b) => {
                        if (a.game.localeCompare(b.game) === 0) {
                            return a.youtuber.localeCompare(b.youtuber);
                        }
                        return a.game.localeCompare(b.game);
                    });
                    assignColors(playlists);
                    displayPlaylists(playlists, currentFilter);
                    addEventListeners();
                    clearForm();
                    updatePlaylistCount();
                }
            })
            .catch((error) => console.error('Error adding playlist:', error));
    });

    document.getElementById('search').addEventListener('input', (event) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const query = event.target.value.toLowerCase();
            currentFilter = query;
            try {
                await fetch('/api/search_log', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ search_term: query }),
                });

                const response = await fetch('/api/playlists');
                const data = await response.json();
                playlists = data.playlists;
                addEventListeners();
                updatePlaylistCount();
                displayPlaylists(playlists, currentFilter);
            } catch (error) {
                console.error('Error fetching playlists:', error);
            }
        }, 230);
    });

    function assignColors(playlists) {
        const uniqueGames = [...new Set(playlists.map((playlist) => playlist.game))];
        shuffleArray(uniqueGames);
        uniqueGames.forEach((game, index) => {
            colorMap[game] = `hsl(${(index * 360) / uniqueGames.length}, 70%, 70%)`;
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function displayPlaylists(playlists, filter = '') {
        const playlistsDiv = document.getElementById('playlists');
        playlistsDiv.innerHTML = '';
        let visibleCount = 0;

        const gameMap = {};

        playlists.forEach((playlist, index) => {
            if (playlist.game.toLowerCase().includes(filter) || playlist.youtuber.toLowerCase().includes(filter)) {
                if (!gameMap[playlist.game]) {
                    gameMap[playlist.game] = [];
                }
                gameMap[playlist.game].push({ ...playlist, index });
            }
        });

        Object.keys(gameMap).forEach((game) => {
            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-group';
            const gameColor = colorMap[game];
            gameDiv.innerHTML = `<h2 style="color: ${gameColor}; text-shadow: 1px 1px black;">${game}</h2>`;

            gameMap[game].forEach((playlist) => {
                const playlistDiv = document.createElement('div');
                playlistDiv.className = 'playlist';
                playlistDiv.innerHTML = `
                    <button class="delete-btn" data-index="${playlist.index}">X</button>
                    <p><a href="${playlist.link}" target="_blank" class="playlist-link" style="color: ${gameColor}; text-shadow: 1px 1px black;">${playlist.youtuber}</a></p>
                    <p> - #<span class="video-number" data-index="${playlist.index}">${playlist.video_number}</span></p>
                `;
                gameDiv.appendChild(playlistDiv);
                visibleCount++;
            });

            playlistsDiv.appendChild(gameDiv);
        });

        document.getElementById('total-playlists').textContent = visibleCount;
        addEventListeners();
    }
    function displayPlaylists(playlists, filter = '') {
        const playlistsDiv = document.getElementById('playlists');
        playlistsDiv.innerHTML = '';
        let visibleCount = 0;

        const gameMap = {};

        playlists.forEach((playlist, index) => {
            if (playlist.game.toLowerCase().includes(filter) || playlist.youtuber.toLowerCase().includes(filter)) {
                if (!gameMap[playlist.game]) {
                    gameMap[playlist.game] = [];
                }
                gameMap[playlist.game].push({ ...playlist, index });
            }
        });

        Object.keys(gameMap).forEach((game) => {
            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-group';
            const gameColor = colorMap[game];
            gameDiv.innerHTML = `<h2 style="color: ${gameColor}; text-shadow: 1px 1px black;">${game}</h2>`;

            const playlistsInnerDiv = document.createElement('div');
            playlistsInnerDiv.classList.add('playlists-inner-div');
            gameDiv.appendChild(playlistsInnerDiv);

            gameMap[game].forEach((playlist) => {
                const playlistDiv = document.createElement('div');
                playlistDiv.className = 'playlist';
                playlistDiv.innerHTML = `
                    <button class="delete-btn" data-index="${playlist.index}">X</button>
                    <p><a href="${playlist.link}" target="_blank" class="playlist-link" style="color: ${gameColor}; text-shadow: 1px 1px black;">${playlist.youtuber}</a></p>
                    <p> - #<span class="video-number" data-index="${playlist.index}">${playlist.video_number}</span></p>
                `;
                playlistsInnerDiv.appendChild(playlistDiv);
                visibleCount++;
            });

            playlistsDiv.appendChild(gameDiv);
        });

        document.getElementById('total-playlists').textContent = visibleCount;
        addEventListeners();
    }

    function addEventListeners() {
        document.querySelectorAll('.playlist-link').forEach((link) => {
            link.addEventListener('mouseover', (event) => {
                event.target.style.color = 'black';
            });
            link.addEventListener('mouseout', (event) => {
                const gameGroup = event.target.closest('.game-group');
                if (gameGroup) {
                    const parentContainer = gameGroup.closest('div');
                    if (parentContainer) {
                        const h2Element = parentContainer.querySelector('h2');
                        if (h2Element) {
                            const game = h2Element.innerText;
                            if (colorMap[game]) {
                                event.target.style.color = colorMap[game];
                            }
                        }
                    }
                }
            });
        });

        document.querySelectorAll('.video-number').forEach((element) => {
            element.addEventListener('click', (event) => {
                event.stopPropagation();
                const target = event.target;
                console.log('Clicked on:', target);

                if (target.nextSibling && target.nextSibling.className === 'editable-input') {
                    console.log('Input already exists, focus on it');
                    target.nextSibling.focus();
                    return;
                }

                const index = target.getAttribute('data-index');
                const currentNumber = target.textContent;

                console.log('Current index:', index);
                console.log('Current number:', currentNumber);

                const input = document.createElement('input');
                input.type = 'number';
                input.value = currentNumber;
                input.step = 0.1;
                input.className = 'editable-input';

                target.style.display = 'none';

                input.addEventListener('blur', () => {
                    const newVideoNumber = input.value || 1;
                    updateVideoNumber(index, newVideoNumber);
                    target.textContent = newVideoNumber;

                    target.style.display = 'inline';
                    input.remove();

                    console.log('Input blurred, new video number:', newVideoNumber);
                });

                target.parentNode.insertBefore(input, target.nextSibling);
                input.focus();

                console.log('Input element created and focused:', input);
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
        document.getElementById('game').focus();
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

document.getElementById('scrollToTop').addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
});
