import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { fillMissingDates } from "./utilities/fillmissingdates.js";

document.addEventListener("DOMContentLoaded", () => {
  let playlistsArray = [];
  let currentFilter = "";
  let debounceTimer;
  const colorMap = {};

  fetch("/api/playlists")
    .then((response) => response.json())
    .then((data) => {
      playlistsArray = data.playlists;
      assignColors(playlistsArray);
      displayPlaylists(playlistsArray);
      updatePlaylistCount();
      updateGameCount();
    })
    .catch((error) => console.error("Error fetching playlists:", error));

  document
    .getElementById("addPlaylistForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      const newPlaylist = {
        game: event.target.game.value,
        video_number: event.target.video_number.value || 1,
        youtuber: event.target.youtuber.value,
        link: event.target.link.value,
      };

      fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlaylist),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            playlistsArray.push(newPlaylist);
            playlistsArray.sort((a, b) => {
              if (a.game.localeCompare(b.game) === 0) {
                return a.youtuber.localeCompare(b.youtuber);
              }
              return a.game.localeCompare(b.game);
            });
            assignColors(playlistsArray);
            displayPlaylists(playlistsArray, currentFilter);
            clearForm();
            updatePlaylistCount();
            updateGameCount();
          }
        })
        .catch((error) => console.error("Error adding playlist:", error));
    });

  document.getElementById("search").addEventListener("input", (event) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentFilter = event.target.value.toLowerCase();
      displayPlaylists(playlistsArray, currentFilter);
      fetch("/api/search_log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ search_term: currentFilter }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log(data);
          }
        })
        .catch((error) => console.error("Error adding playlist:", error));
    }, 430);
  });

  function assignColors(playlists) {
    const uniqueGames = [
      ...new Set(playlists.map((playlist) => playlist.game)),
    ];
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

  function displayPlaylists(playlists, filter = "") {
    const playlistsDiv = document.getElementById("playlists");
    playlistsDiv.innerHTML = "";
    let visibleCount = 0;

    const gameMap = {};

    playlists.forEach((playlist) => {
      if (
        playlist.game.toLowerCase().includes(filter) ||
        playlist.youtuber.toLowerCase().includes(filter)
      ) {
        if (!gameMap[playlist.game]) {
          gameMap[playlist.game] = [];
        }
        gameMap[playlist.game].push(playlist);
      }
    });

    Object.keys(gameMap).forEach((game) => {
      const gameDiv = document.createElement("div");
      gameDiv.className = "game-group";

      const gameDivHeaderDiv = document.createElement("div");
      gameDivHeaderDiv.classList.add("game-group-header-div");
      gameDiv.appendChild(gameDivHeaderDiv);

      const gameColor = colorMap[game];
      gameDivHeaderDiv.innerHTML = `<h2 style="color: ${gameColor}; text-shadow: 1px 1px black;">${game}</h2>`;

      const viewLogsButton = document.createElement("button");
      viewLogsButton.textContent = "View Activity";
      viewLogsButton.classList.add("view-logs-button");
      viewLogsButton.onclick = () => showLogsForGame(game);
      gameDivHeaderDiv.appendChild(viewLogsButton);

      const playlistCount = gameMap[game].length;
      const openAllButton = document.createElement("button");
      openAllButton.textContent = `Open ${playlistCount} Playlists`;
      openAllButton.classList.add("open-all-button");
      openAllButton.onclick = () => {
        gameMap[game].forEach((playlist) => {
          window.open(playlist.link, "_blank");
        });
      };
      gameDivHeaderDiv.appendChild(openAllButton);

      const deleteAllButton = document.createElement("button");
      deleteAllButton.textContent = `Delete ${playlistCount} Playlists`;
      deleteAllButton.classList.add("delete-all-button");
      deleteAllButton.onclick = () => deleteAllPlaylists(game, gameDiv);
      gameDivHeaderDiv.appendChild(deleteAllButton);

      const playlistsInnerDiv = document.createElement("div");
      playlistsInnerDiv.classList.add("playlists-inner-div");
      gameDiv.appendChild(playlistsInnerDiv);

      gameMap[game].forEach((playlist) => {
        const playlistDiv = document.createElement("div");
        playlistDiv.className = "playlist";
        playlistDiv.innerHTML = `
          <button class="delete-btn" data-index="${playlists.indexOf(
            playlist
          )}">X</button>
          <p>
            <a href="${
              playlist.link
            }" target="_blank" class="playlist-link" style="color: ${gameColor}; text-shadow: 1px 1px black;">
              ${playlist.youtuber}
            </a>
          </p>
          <p> - #<span class="video-number" data-index="${playlists.indexOf(
            playlist
          )}">${playlist.video_number}</span></p>
        `;

        const playlistLink = playlistDiv.querySelector(".playlist-link");
        let isHovering = false;
        playlistLink.addEventListener("mouseover", () => {
          isHovering = true;
        });
        playlistLink.addEventListener("mouseout", () => {
          isHovering = false;
        });
        document.addEventListener("keydown", (event) => {
          if (isHovering && event.key === "c") {
            navigator.clipboard
              .writeText(playlistLink.href)
              .then(() => {
                console.log(`Copied URL to clipboard: ${playlistLink.href}`);
              })
              .catch((err) => {
                console.error("Failed to copy URL to clipboard", err);
              });
          }
        });

        playlistsInnerDiv.appendChild(playlistDiv);
        visibleCount++;
      });

      playlistsDiv.appendChild(gameDiv);
    });

    document.getElementById("total-playlists").textContent = visibleCount;
    updateGameCount();
    addEventListeners();
    updateYouTuberCount();
  }

  function showLogsForGame(game) {
    fetch("/api/query_logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const logs = data.logs;
          const counts = {};
          logs.forEach((log) => {
            const date = log.timestamp;
            counts[date] = (counts[date] || 0) + 1;
          });
          Object.keys(counts).forEach((date) => {
            counts[date] = counts[date] / 2;
          });
          const chartData = Object.keys(counts).map((date) => ({
            date,
            count: counts[date],
          }));
          openLogModal(game, chartData);
        } else {
          console.error("No log data returned:", data.error);
        }
      })
      .catch((error) => console.error("Error fetching logs:", error));
  }

  function openLogModal(game, chartData) {
    let modal = document.getElementById("logModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "logModal";
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      modal.style.display = "flex";
      modal.style.alignItems = "center";
      modal.style.justifyContent = "center";
      modal.style.zIndex = "100000000";
      document.body.appendChild(modal);
    }
    modal.innerHTML = "";
    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.width = "80%";
    modalContent.style.width = "900px";
    modalContent.style.position = "relative";

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.classList.add("close-button");
    closeButton.onclick = () => (modal.style.display = "none");
    modalContent.appendChild(closeButton);

    const title = document.createElement("h2");
    title.textContent = `Activity For "${game}"`;
    modalContent.appendChild(title);

    const chartContainer = document.createElement("div");
    chartContainer.id = "d3Chart";
    modalContent.appendChild(chartContainer);

    modal.appendChild(modalContent);
    modal.style.display = "flex";

    renderLineGraph(chartData, "#d3Chart");
  }

  function renderLineGraph(data, selector) {
    const counts = {};
    data.forEach((d) => {
      counts[d.date] = d.count;
    });

    const filledCounts = fillMissingDates(counts);

    const lineData = Object.keys(filledCounts)
      .map((date) => ({ date: new Date(date), count: filledCounts[date] }))
      .sort((a, b) => a.date - b.date);

    const margin = { top: 20, right: 20, bottom: 30, left: 40 },
      width = 870 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select(selector)
      .html("")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(lineData, (d) => d.date))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(lineData, (d) => d.count)])
      .nice()
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.count))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);
  }

  function deleteAllPlaylists(game, gameDiv) {
    if (!confirm("Are you sure you want to delete these playlists?")) {
      return;
    }
    fetch("/api/playlists/delete_by_game", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ game }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          playlistsArray = playlistsArray.filter(
            (playlist) => playlist.game !== game
          );
          gameDiv.remove();
          updatePlaylistCount();
          updateGameCount();
        } else {
          console.error("Error deleting some playlists:", data.error);
        }
      })
      .catch((error) => console.error("Error deleting playlists:", error));
  }

  function addEventListeners() {
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        if (!confirm("Are you sure you want to delete this playlist?")) {
          return;
        }
        const index = event.target.getAttribute("data-index");
        const playlistDiv = event.target.closest(".playlist");
        deletePlaylist(index, playlistDiv);
      });
    });

    document.querySelectorAll(".playlist-link").forEach((link) => {
      link.addEventListener("mouseover", (event) => {
        event.target.style.color = "black";
      });
      link.addEventListener("mouseout", (event) => {
        const gameGroup = event.target.closest(".game-group");
        if (gameGroup) {
          const parentContainer = gameGroup.closest("div");
          if (parentContainer) {
            const h2Element = parentContainer.querySelector("h2");
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

    document.querySelectorAll(".video-number").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        const target = event.target;

        if (
          target.nextSibling &&
          target.nextSibling.className === "editable-input"
        ) {
          target.nextSibling.focus();
          return;
        }

        const index = target.getAttribute("data-index");
        const currentNumber = target.textContent;

        const input = document.createElement("input");
        input.type = "number";
        input.value = currentNumber;
        input.step = 0.1;
        input.className = "editable-input";

        target.style.display = "none";

        input.addEventListener("blur", () => {
          const newVideoNumber = input.value || 1;
          updateVideoNumber(index, newVideoNumber);
          target.textContent = newVideoNumber;

          target.style.display = "inline";
          input.remove();
        });

        target.parentNode.insertBefore(input, target.nextSibling);
        input.focus();
      });
    });
  }

  function clearForm() {
    document.getElementById("game").value = "";
    document.getElementById("game").focus();
    document.getElementById("video_number").value = 1;
    document.getElementById("youtuber").value = "";
    document.getElementById("link").value = "";
  }

  function updatePlaylistCount() {
    const totalPlaylists = document.querySelectorAll(".playlist").length;
    document.getElementById("total-playlists").textContent = totalPlaylists;
  }

  function updateGameCount() {
    const totalGames = document.querySelectorAll("h2").length;
    document.getElementById("total-games").textContent = totalGames;
  }

  function updateYouTuberCount() {
    const totalYouTubers = [...document.querySelectorAll(".playlist-link")];
    const uniqueYouTubers = [];
    for (let p = 0; p < totalYouTubers.length; p += 1) {
      if (
        uniqueYouTubers.every((e) => e !== String(totalYouTubers[p].innerText))
      ) {
        uniqueYouTubers.push(String(totalYouTubers[p].innerText));
      }
    }
    document.getElementById("total-youtubers").textContent =
      uniqueYouTubers.length;
  }
  function updateVideoNumber(index, newVideoNumber) {
    fetch(`/api/playlists/${index}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ video_number: newVideoNumber }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          console.error("Error updating video number:", data.error);
        }
      })
      .catch((error) => console.error("Error updating video number:", error));
  }

  function deletePlaylist(index, element) {
    fetch(`/api/playlists/${index}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          element.remove();
          playlistsArray = playlistsArray.filter(
            (playlist, idx) => idx !== parseInt(index)
          );
          updateIndices();
          updatePlaylistCount();
          updateGameCount();
        } else {
          console.error("Error deleting playlist:", data.error);
        }
      })
      .catch((error) => console.error("Error deleting playlist:", error));
  }

  function updateIndices() {
    document.querySelectorAll(".playlist").forEach((playlistDiv, index) => {
      playlistDiv
        .querySelector(".delete-btn")
        .setAttribute("data-index", index);
      playlistDiv
        .querySelector(".video-number")
        .setAttribute("data-index", index);
    });
  }

  document.getElementById("scrollToTop").addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  const progressBar = document.getElementById("progress-bar");

  function throttle(fn, wait) {
    let lastTime = 0;
    return function (...args) {
      const now = new Date().getTime();
      if (now - lastTime >= wait) {
        fn.apply(this, args);
        lastTime = now;
      }
    };
  }

  function updateProgressBar() {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = scrollPercentage + "%";
  }

  document.addEventListener("scroll", throttle(updateProgressBar, 50));

  function centerProgressBar() {
    const progressBarContainer = document.getElementById(
      "progress-bar-container"
    );
    const containerWidth = progressBarContainer.offsetWidth;
    const viewportWidth = document.documentElement.clientWidth;

    const leftOffset = (viewportWidth - containerWidth) / 2;
    progressBarContainer.style.left = `${leftOffset}px`;
  }

  centerProgressBar();
  window.addEventListener("resize", centerProgressBar);
});
