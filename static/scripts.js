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
    .catch((error) => {
      console.error("Error fetching playlists:", error);
      const playlistsDiv = document.getElementById("playlists");
      playlistsDiv.innerHTML = "";
      const message = document.createElement("p");
      message.className = "status-message";
      message.textContent = "Failed to load playlists. Is the server running?";
      playlistsDiv.appendChild(message);
    });

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
            playlistsArray.push(data.playlist);
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
          } else {
            console.error("Error adding playlist:", data.error);
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

  document.addEventListener("keydown", (event) => {
    if (event.key !== "c" || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const hoveredLink = document.querySelector(".playlist-link:hover");
    if (!hoveredLink) {
      return;
    }
    navigator.clipboard
      .writeText(hoveredLink.href)
      .then(() => {
        console.log(`Copied URL to clipboard: ${hoveredLink.href}`);
      })
      .catch((err) => {
        console.error("Failed to copy URL to clipboard", err);
      });
  });

  function assignColors(playlists) {
    const uniqueGames = [
      ...new Set(playlists.map((playlist) => playlist.game)),
    ];
    const GOLDEN_RATIO = 0.618033988749895;
    const lightnessSteps = [44, 36, 50];
    uniqueGames.forEach((game, index) => {
      let hue = ((index * GOLDEN_RATIO) % 1) * 315;
      if (hue > 45) {
        hue += 45;
      }
      const lightness = lightnessSteps[index % lightnessSteps.length];
      colorMap[game] = `hsl(${hue.toFixed(1)}, 95%, ${lightness}%)`;
    });
  }

  const collapsedLetters = new Set();
  const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

  function letterFor(game) {
    const first = game.charAt(0).toUpperCase();
    return first >= "A" && first <= "Z" ? first : "#";
  }

  function sectionId(letter) {
    return letter === "#" ? "letter-num" : `letter-${letter}`;
  }

  function createLetterSection(letter, filter) {
    const section = document.createElement("section");
    section.className = "letter-section";
    section.id = sectionId(letter);
    section.dataset.letter = letter;
    if (!filter && collapsedLetters.has(letter)) {
      section.classList.add("collapsed");
    }

    const header = document.createElement("button");
    header.type = "button";
    header.className = "letter-header";

    const chevron = document.createElement("span");
    chevron.className = "letter-chevron";
    chevron.textContent = "▾";
    const title = document.createElement("span");
    title.className = "letter-title";
    title.textContent = letter;
    const countSpan = document.createElement("span");
    countSpan.className = "letter-count";
    header.append(chevron, title, countSpan);

    header.addEventListener("click", () => {
      if (section.classList.toggle("collapsed")) {
        collapsedLetters.add(letter);
      } else {
        collapsedLetters.delete(letter);
      }
      updateActiveLetter();
    });

    const games = document.createElement("div");
    games.className = "letter-games";

    section.append(header, games);
    return { section, games, countSpan };
  }

  function renderLetterNav(availableLetters) {
    const linksDiv = document.getElementById("letter-links");
    linksDiv.innerHTML = "";
    LETTERS.forEach((letter) => {
      const link = document.createElement("button");
      link.type = "button";
      link.className = "letter-link";
      link.textContent = letter;
      if (availableLetters.has(letter)) {
        link.addEventListener("click", () => jumpToLetter(letter));
      } else {
        link.disabled = true;
      }
      linksDiv.appendChild(link);
    });
  }

  function updateActiveLetter() {
    const sections = document.querySelectorAll(".letter-section");
    const links = document.querySelectorAll(".letter-link");
    if (sections.length === 0) {
      links.forEach((link) => link.classList.remove("active"));
      return;
    }
    const headerHeight = document.querySelector("header").offsetHeight;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= headerHeight + 12) {
        current = section;
      }
    });
    const activeLetter = current.dataset.letter;
    links.forEach((link) => {
      link.classList.toggle("active", link.textContent === activeLetter);
    });
  }

  function jumpToLetter(letter) {
    const section = document.getElementById(sectionId(letter));
    if (!section) {
      return;
    }
    section.classList.remove("collapsed");
    collapsedLetters.delete(letter);
    const headerHeight = document.querySelector("header").offsetHeight;
    const top =
      section.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
    window.scrollTo({ top, behavior: "smooth" });
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

    const letterSections = {};

    Object.keys(gameMap).forEach((game) => {
      const letter = letterFor(game);
      if (!letterSections[letter]) {
        letterSections[letter] = createLetterSection(letter, filter);
        playlistsDiv.appendChild(letterSections[letter].section);
      }

      const gameDiv = document.createElement("div");
      gameDiv.className = "game-group";

      const gameDivHeaderDiv = document.createElement("div");
      gameDivHeaderDiv.classList.add("game-group-header-div");
      gameDiv.appendChild(gameDivHeaderDiv);

      const gameColor = colorMap[game];
      const gameHeading = document.createElement("h2");
      gameHeading.style.color = gameColor;
      gameHeading.textContent = game;
      gameDivHeaderDiv.appendChild(gameHeading);

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
        let blockedCount = 0;
        gameMap[game].forEach((playlist) => {
          if (!window.open(playlist.link, "_blank")) {
            blockedCount++;
          }
        });
        if (blockedCount > 0) {
          alert(
            `Your browser blocked ${blockedCount} of ${playlistCount} playlist tabs. Allow popups for this site to open them all at once.`,
          );
        }
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

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.dataset.id = playlist.id;
        deleteButton.textContent = "X";
        deleteButton.setAttribute(
          "aria-label",
          `Delete ${playlist.youtuber} playlist for ${game}`,
        );
        playlistDiv.appendChild(deleteButton);

        const linkParagraph = document.createElement("p");
        const playlistLink = document.createElement("a");
        playlistLink.href = playlist.link;
        playlistLink.target = "_blank";
        playlistLink.rel = "noopener";
        playlistLink.className = "playlist-link";
        playlistLink.style.color = gameColor;
        playlistLink.textContent = playlist.youtuber;
        linkParagraph.appendChild(playlistLink);
        playlistDiv.appendChild(linkParagraph);

        const numberParagraph = document.createElement("p");
        numberParagraph.append(" - ");
        const videoNumberSpan = document.createElement("span");
        videoNumberSpan.className = "video-number";
        videoNumberSpan.dataset.id = playlist.id;
        videoNumberSpan.textContent = playlist.video_number;
        numberParagraph.appendChild(videoNumberSpan);
        playlistDiv.appendChild(numberParagraph);

        playlistsInnerDiv.appendChild(playlistDiv);
        visibleCount++;
      });

      letterSections[letter].games.appendChild(gameDiv);
    });

    Object.values(letterSections).forEach(({ games, countSpan }) => {
      const gameCount = games.children.length;
      countSpan.textContent = `${gameCount} game${gameCount === 1 ? "" : "s"}`;
    });

    if (visibleCount === 0) {
      const message = document.createElement("p");
      message.className = "status-message";
      message.textContent = filter
        ? `No playlists match "${filter}".`
        : "No playlists yet. Add your first one above.";
      playlistsDiv.appendChild(message);
    }

    renderLetterNav(new Set(Object.keys(letterSections)));
    updateActiveLetter();

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
    const container = d3.select(selector).html("");

    if (data.length === 0) {
      container
        .append("p")
        .attr("class", "status-message")
        .text("No activity recorded for this game yet.");
      return;
    }

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

    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let xDomain = d3.extent(lineData, (d) => d.date);
    if (xDomain[0].getTime() === xDomain[1].getTime()) {
      xDomain = [
        d3.timeDay.offset(xDomain[0], -1),
        d3.timeDay.offset(xDomain[1], 1),
      ];
    }

    const x = d3.scaleTime().domain(xDomain).range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(lineData, (d) => d.count)])
      .nice()
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .tickValues(y.ticks().filter(Number.isInteger))
          .tickFormat(d3.format("d")),
      );

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

    svg
      .selectAll("circle")
      .data(lineData)
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.count))
      .attr("fill", "steelblue");
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
            (playlist) => playlist.game !== game,
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
        const id = event.target.getAttribute("data-id");
        const playlistDiv = event.target.closest(".playlist");
        deletePlaylist(id, playlistDiv);
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

        const id = target.getAttribute("data-id");
        const currentNumber = target.textContent;

        const input = document.createElement("input");
        input.type = "number";
        input.value = currentNumber;
        input.step = 0.1;
        input.className = "editable-input";

        target.style.display = "none";

        input.addEventListener("blur", () => {
          const newVideoNumber = input.value || 1;
          updateVideoNumber(id, newVideoNumber);
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
  function updateVideoNumber(id, newVideoNumber) {
    fetch(`/api/playlists/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ video_number: newVideoNumber }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const playlist = playlistsArray.find((p) => p.id === id);
          if (playlist) {
            playlist.video_number = data.playlist.video_number;
          }
        } else {
          console.error("Error updating video number:", data.error);
        }
      })
      .catch((error) => console.error("Error updating video number:", error));
  }

  function deletePlaylist(id, element) {
    fetch(`/api/playlists/${id}`, {
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
            (playlist) => playlist.id !== id,
          );
          updatePlaylistCount();
          updateGameCount();
        } else {
          console.error("Error deleting playlist:", data.error);
        }
      })
      .catch((error) => console.error("Error deleting playlist:", error));
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
    let trailing;
    return function (...args) {
      const now = Date.now();
      clearTimeout(trailing);
      if (now - lastTime >= wait) {
        fn.apply(this, args);
        lastTime = now;
      } else {
        trailing = setTimeout(
          () => {
            fn.apply(this, args);
            lastTime = Date.now();
          },
          wait - (now - lastTime),
        );
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

  document.addEventListener(
    "scroll",
    throttle(() => {
      updateProgressBar();
      updateActiveLetter();
    }, 50),
  );
});
