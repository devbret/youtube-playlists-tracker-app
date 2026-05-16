# YouTube Playlists Tracker App

![Organized YouTube playlists with counters for the next video to watch.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/abe9a12e-1e93-423a-bbcf-8a437350b73a.png)

Manages a JSON-based video game playlist library through CRUD API endpoints, serves frontend pages and data files and logs requests, responses, searches and playlist activity for analytics and querying.

## Set Up Instructions

Below are the required software programs and steps for installing and using this application.

### Programs Needed

- [Git](https://git-scm.com/downloads)

- [Python](https://www.python.org/downloads/)

### Steps

1. Install the above programs

2. Open a terminal

3. Clone this repository using `git` by running the following command: `git clone git@github.com:devbret/youtube-playlists-tracker-app.git`

4. Navigate to the repo's directory by running: `cd youtube-playlists-tracker-app`

5. Install the needed dependencies for running the script by running: `pip install -r requirements.txt`

6. Run the script with the command: `python3 app.py`

7. After the Flask server has started, visit [this link](http://127.0.0.1:5500/) in a browser, and you will be brought to the live application

8. Enter details for a favorite playlist into the four fields at the top of the program, and press the "Add Playlist" button

9. You can now see a collection of playlists, auto-populating on the screen

10. These entries can be filtered via the search bar at the top left of your screen

## Video Game Activity

![Total activity for a specific video game. In this case, it is "Skyrim".](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/4dedc977-afeb-4040-986d-a6f392e802da.png)

Each video game has a "View Activity" button, which displays the volume of relevant actions over time for a given game since being first added. These data visualizations are intended to help explore how frequently and when you engage with a particular video game.

## Application Usage Analytics

![Sixteen different graphs, each displaying a unique metric.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/5e37ab17-5a60-4ae6-81c0-01e1728323f0.png)

You will notice while using the application, each basic interaction is logged in a local file named `app_log.csv`. This file powers 16 data analysis tools, intended to help users of the YouTube Playlists Tracker App discover their personal habits and preferences over time.

## Network Graph Feature

![A visualization of the interconnections shared by each YouTuber and playlist category.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/8a157fad-0438-42c8-a6b1-e108ed785791.png)

There is also an interactive network graph for exploring connections among your saved playlist categories and individual YouTubers. This utility is helpful for quickly understanding how playlist categories and gamers relate to each other.

## Other Thoughts

The intended use of this program is for collecting and tracking the user's viewing progress with video game playthroughs on YouTube. Which are almost always organized as linkable playlists. But one could feasibly use this application to curate any variety of categorized linkable hypermedia.
