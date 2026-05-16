# YouTube Playlists Tracker App

![Organized YouTube playlists with counters for the next video to watch.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/abe9a12e-1e93-423a-bbcf-8a437350b73a.png)

Manage a video game playlist library with `Flask` APIs, frontend playlist controls, D3 network graph and activity logging which powers usage analytics and playlist history queries.

## Overview

The `Flask` backend stores playlist data in a local `playlists.json` file, exposes API routes and records app activity in `app_log.csv`. It also serves the playlist view, network graph and analytics dashboard while logging key actions such as page visits, searches, playlist additions and response statuses.

The frontend fetches `.json` data, groups and renders playlists, assigns each game a color and lets users open every playlist in a group at once. The analytics dashboard then transforms the `.csv` log data into multiple D3 visualizations, including bar charts, a word cloud, an activity heatmap and more. And the network graph adds an interactive view which connects video game nodes to YouTuber nodes.

## Set Up Instructions

Below are the required software programs and steps for installing and using this application on a Linux machine.

### Programs Needed

- [Git](https://git-scm.com/downloads)

- [Python](https://www.python.org/downloads/)

### Steps

1. Install the above programs

2. Open a terminal

3. Clone this repository: `git clone git@github.com:devbret/youtube-playlists-tracker-app.git`

4. Navigate to the repo's directory: `cd youtube-playlists-tracker-app`

5. Create a virtual environment: `python3 -m venv venv`

6. Activate your virtual environment: `source venv/bin/activate`

7. Install the needed dependencies: `pip install -r requirements.txt`

8. Run the primary script: `python3 app.py`

9. Open the app frontend via your browser: `http://127.0.0.1:5500`

10. When finished using the app: `CTRL + C`

11. Exit the virtual environment: `deactivate`

## Video Game Activity

![Total activity for a specific video game. In this case, it is "Skyrim".](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/4dedc977-afeb-4040-986d-a6f392e802da.png)

Each video game has a "View Activity" button, which displays the volume of relevant actions over time for a given game since being first added. These data visualizations are intended to help explore how frequently and when you engage with a particular video game.

## Application Usage Analytics

![Sixteen different graphs, each displaying a unique metric.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/5e37ab17-5a60-4ae6-81c0-01e1728323f0.png)

You will notice while using the application, each basic interaction is logged in a local file named `app_log.csv`. This file powers 16 data analysis tools, intended to help users of the YouTube Playlists Tracker App discover their personal habits and preferences over time.

## Network Graph Feature

![A visualization of the interconnections shared by each YouTuber and playlist category.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/8a157fad-0438-42c8-a6b1-e108ed785791.png)

There is also an interactive network graph for exploring connections among your saved playlist categories and individual YouTubers. This utility is helpful for quickly understanding how playlist categories and gamers relate to each other.

## Other Considerations

This project repo is intended to demonstrate an ability to do the following:

- Provide a CRUD system for storing, organizing, updating and deleting video game playlist records from a local `.json` file

- Offer users an interactive frontend for browsing playlists by game and managing entries

- Visualize playlist relationships through a D3 network graph which connects video games with associated YouTubers

- Convert activity logs into dashboards to reveal app usage patterns, search activity, request distributions and playlist changes over time

If you have any questions or would like to collaborate, please reach out either on GitHub or via [my website](https://bretbernhoft.com/).

### Intended Use And Beyond

The intended use of this program is for collecting and tracking the user's viewing progress with video game playthroughs on YouTube. Which are almost always organized as linkable playlists. But one could feasibly use this application to curate any variety of categorized linkable hypermedia.
