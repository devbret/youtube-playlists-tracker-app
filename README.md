# YouTube Playlists Tracker App

![Organized YouTube playlists with counters for the next video to watch.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/760b23fa-86e2-4ea0-ad88-f2047b85f397.png)

Catalog your viewing progress with specific YouTube playlists, organized by user-defined categories, via this app.

## Set Up

### Programs Needed

- [Git](https://git-scm.com/downloads)

- [Python](https://www.python.org/downloads/) (When installing on Windows, make sure you check the ["Add python 3.xx to PATH"](https://hosting.photobucket.com/images/i/bernhoftbret/python.png) box.)

### Steps

1. Install the above programs.

2. Open a shell window (For Windows open PowerShell, for MacOS open Terminal & for Linux open your distro's terminal emulator).

3. Clone this repository using `git` by running the following command; `git clone git@github.com:devbret/youtube-playlists-tracker-app.git`.

4. Navigate to the repo's directory by running; `cd youtube-playlists-tracker-app`.

5. Install the needed dependencies for running the script by running; `pip install -r requirements.txt`.

6. Run the script with the command `python3 app.py`. After the Flask server has started, visit [this link](http://127.0.0.1:5500/) in a browser, and you will be brought to the live application.

7. Enter details for a favorite playlist into the four fields at the top of the program, and press the "Add Playlist" button. This can be repeated any number of times.

8. You can now see a collection of playlists, auto-populating on the screen. These entries can be filtered via the search bar at the top left of your screen.

## Video Game Activity

![Total activity for a specific video game. In this case, it is "Skyrim".](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/621523be-bfea-4d99-8275-b0b7fc01726d.png)

Each video game has a "View Activity" button, which displays the volume of relevant actions over time for a given game, since being first added. These data visualizations are intended to help explore how frequently and when you engage with a particular video game.

## Application Usage Analytics

![Sixteen different graphs, each displaying a unique metric.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/538ec2ba-85b6-4c3f-8a59-f4eb2a322f2f.png)

You will notice while using the application, each basic interaction is logged in a local file named `app_log.csv`. This file powers 16 data analysis tools, intended to help users of the YouTube Playlists Tracker App discover their personal habits and preferences over time.

## Network Graph Feature

![A visualization of the interconnections shared by each YouTuber and playlist category.](https://hosting.photobucket.com/bbcfb0d4-be20-44a0-94dc-65bff8947cf2/01d37f92-49b6-473a-82a1-c794a6ea6a7e.png)

There is also an interactive network graph for exploring connections among your saved playlist categories and individual YouTubers. This utility is helpful for quickly understanding how collected playlist categories and gamers relate to each other.

## Other Thoughts

The intended use of this program is for collecting and tracking the user's viewing progress with video game playthroughs on YouTube. Which are almost always organized as linkable playlists. But one could feasibly use this application to curate any variety of linkable hypermedia.
