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
            updatePlaylistCount();
            updateGameCount();
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
                    clearForm();
                    updatePlaylistCount();
                    updateGameCount();
                }
            })
            .catch((error) => console.error('Error adding playlist:', error));
    });

    document.getElementById('search').addEventListener('input', (event) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentFilter = event.target.value.toLowerCase();
            displayPlaylists(playlists, currentFilter);
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

        playlists.forEach((playlist) => {
            if (playlist.game.toLowerCase().includes(filter) || playlist.youtuber.toLowerCase().includes(filter)) {
                if (!gameMap[playlist.game]) {
                    gameMap[playlist.game] = [];
                }
                gameMap[playlist.game].push(playlist);
            }
        });

        Object.keys(gameMap).forEach((game) => {
            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-group';
            const gameDivHeaderDiv = document.createElement('div');
            gameDivHeaderDiv.classList.add('game-group-header-div');
            gameDiv.appendChild(gameDivHeaderDiv);
            const gameColor = colorMap[game];
            gameDivHeaderDiv.innerHTML = `<h2 style="color: ${gameColor}; text-shadow: 1px 1px black;">${game}</h2>`;

            const openAllButton = document.createElement('button');
            openAllButton.textContent = 'Open All Playlists';
            openAllButton.classList.add('open-all-button');
            openAllButton.onclick = () => {
                gameMap[game].forEach((playlist) => {
                    window.open(playlist.link, '_blank');
                });
            };
            gameDivHeaderDiv.appendChild(openAllButton);

            const deleteAllButton = document.createElement('button');
            deleteAllButton.textContent = 'Delete All Playlists';
            deleteAllButton.classList.add('delete-all-button');
            deleteAllButton.onclick = () => deleteAllPlaylists(game, gameDiv);
            gameDivHeaderDiv.appendChild(deleteAllButton);

            const playlistsInnerDiv = document.createElement('div');
            playlistsInnerDiv.classList.add('playlists-inner-div');
            gameDiv.appendChild(playlistsInnerDiv);

            gameMap[game].forEach((playlist) => {
                const playlistDiv = document.createElement('div');
                playlistDiv.className = 'playlist';
                playlistDiv.innerHTML = `
                    <button class="delete-btn" data-index="${playlists.indexOf(playlist)}">X</button>
                    <p><a href="${playlist.link}" target="_blank" class="playlist-link" style="color: ${gameColor}; text-shadow: 1px 1px black;">${
                    playlist.youtuber
                }</a></p>
                    <p> - #<span class="video-number" data-index="${playlists.indexOf(playlist)}">${playlist.video_number}</span></p>
                `;
                playlistsInnerDiv.appendChild(playlistDiv);
                visibleCount++;
            });

            playlistsDiv.appendChild(gameDiv);
        });

        document.getElementById('total-playlists').textContent = visibleCount;
        updateGameCount();
        addEventListeners();
    }

    function deleteAllPlaylists(game, gameDiv) {
        fetch('/api/playlists/delete_by_game', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ game }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    playlists = playlists.filter((playlist) => playlist.game !== game);
                    console.log(playlists);
                    gameDiv.remove();
                    updatePlaylistCount();
                    updateGameCount();
                } else {
                    console.error('Error deleting some playlists:', data.error);
                }
            })
            .catch((error) => console.error('Error deleting playlists:', error));
    }

    function addEventListeners() {
        document.querySelectorAll('.delete-btn').forEach((button) => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                const playlistDiv = event.target.closest('.playlist');
                deletePlaylist(index, playlistDiv);
            });
        });

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

                if (target.nextSibling && target.nextSibling.className === 'editable-input') {
                    target.nextSibling.focus();
                    return;
                }

                const index = target.getAttribute('data-index');
                const currentNumber = target.textContent;

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
                });

                target.parentNode.insertBefore(input, target.nextSibling);
                input.focus();
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

    function updateGameCount() {
        const totalGames = document.querySelectorAll('h2').length;
        document.getElementById('total-games').textContent = totalGames;
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
                playlists = playlists.filter((playlist, idx) => idx !== parseInt(index));
                updateIndices();
                updatePlaylistCount();
                updateGameCount();
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
