# YouTube Playlist App

![Organized YouTube playlists with counters for the next video to watch.](https://hosting.photobucket.com/images/i/bernhoftbret/youtube-playlists-app-screenshot-updated.png)

Catalog your viewing progress with specific YouTube playlists using this app.

## Set Up

### Programs Needed

-   [Git](https://git-scm.com/downloads)
-   [Python](https://www.python.org/downloads/) (When installing on Windows, make sure you check the ["Add python 3.xx to PATH"](https://hosting.photobucket.com/images/i/bernhoftbret/python.png) box.)

### Steps

1. Install the above programs.
2. Open a shell window (For Windows open PowerShell, for MacOS open Terminal & for Linux open your distro's terminal emulator).
3. Clone this repository using `git` by running the following command; `git clone https://github.com/devbret/youtube-playlists-app`.
4. Navigate to the repo's directory by running; `cd youtube-playlists-app`.
5. Install the needed dependencies for running the script by running; `pip install -r requirements.txt`.
6. Run the script with the command `python3 app.py`. After the Flask server has started, visit [this link](http://127.0.0.1:5000/) in a browser, and you will be brought to the live application.
7. Enter details for a favorite playlist into the four fields at the top of the program, and press the "Add Playlist" button. This can be repeated any number of times.
8. You can now see a collection of playlists, auto-populating on the screen. These entries can be filtered via the search bar at the top left of your screen.

## Logging Features

You will notice that while using the app, each basic interaction is logged in a file named `app_log.csv`. The purpose of this file is to power numerous data analysis tools soon to be released, that help users of the YouTube Playlists App discover their personal viewing habits.
