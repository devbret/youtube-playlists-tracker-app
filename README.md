# YouTube Playlists Tracker App

![Organized YouTube playlists with counters for the next video to watch.](https://hosting.photobucket.com/images/i/bernhoftbret/youtube-playlists-tracker-home-page.png)

Catalog your viewing progress with specific YouTube playlists, organized by user-defined categories, via this app.

## Set Up

### Programs Needed

- [Git](https://git-scm.com/downloads)
- [Python](https://www.python.org/downloads/) (When installing on Windows, make sure you check the ["Add python 3.xx to PATH"](https://hosting.photobucket.com/images/i/bernhoftbret/python.png) box.)

### Steps

1. Install the above programs.
2. Open a shell window (For Windows open PowerShell, for MacOS open Terminal & for Linux open your distro's terminal emulator).
3. Clone this repository using `git` by running the following command; `git clone https://github.com/devbret/youtube-playlists-tracker-app`.
4. Navigate to the repo's directory by running; `cd youtube-playlists-tracker-app`.
5. Install the needed dependencies for running the script by running; `pip install -r requirements.txt`.
6. Run the script with the command `python3 app.py`. After the Flask server has started, visit [this link](http://127.0.0.1:5500/) in a browser, and you will be brought to the live application.
7. Enter details for a favorite playlist into the four fields at the top of the program, and press the "Add Playlist" button. This can be repeated any number of times.
8. You can now see a collection of playlists, auto-populating on the screen. These entries can be filtered via the search bar at the top left of your screen.

## Application Usage Analytics

![Fourteen different graphs, each displaying a unique metric.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/da1a156d-0db0-4635-bc0c-a3d15340a3d0.png)

You will notice while using the application, each basic interaction is logged in a local file named `app_log.csv`. This file powers fifteen data analysis tools, intended to help users of the YouTube Playlists Tracker App discover their personal habits and preferences over time.

## Network Graph Feature

![A visualization of the interconnections shared by each YouTuber and playlist.](https://hosting.photobucket.com/images/i/bernhoftbret/youtube-playlists-tracker-app-network-graph-page.png)

There is also a network graph feature, interactively displaying any connections shared by your saved playlist categories and individual YouTubers. This tool is useful for quickly exploring how any collected playlists and gamers relate with each other.

## Other Thoughts

The intended use of this program is collecting and tracking the user's viewing progress with video game playthroughs on YouTube. Which are almost always organized as linkable playlists. But one could feasibly use this application to curate any variety of hypermedia resources.
