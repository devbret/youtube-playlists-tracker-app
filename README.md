# YouTube Playlist App

![Organized YouTube playlists with counters for the next video to watch.](https://hosting.photobucket.com/images/i/bernhoftbret/screenshot-of-youtube-playlist-app.png)

Catalog your viewing progress for YouTube playlists using this app.

If you would like to view a brief demo of this application, [here is a YouTube video](https://youtu.be/Rb-TWpgzA4g) that you might find useful.

## Set Up

### Programs Needed

-   [Git](https://git-scm.com/downloads)
-   [Python](https://www.python.org/downloads/) (When installing on Windows, make sure you check the ["Add python 3.xx to PATH"](https://hosting.photobucket.com/images/i/bernhoftbret/python.png) box.)

### Steps

1. Install the above programs.
2. Open a shell window (For Windows open PowerShell, for MacOS open Terminal & for Linux open your distro's terminal emulator).
3. Clone this repository using `git` by running the following command; `git clone https://github.com/devbret/youtube-playlist-app`.
4. Navigate to the repo's directory by running; `cd youtube-playlist-app`.
5. Install the needed dependencies for running the script by running; `pip install -r requirements.txt`.
6. Run the script with the command `python3 app.py`. Open the link that the Flask server generates for you, this will bring you to the app.
7. Enter details for a favorite playlist, into the four fields at the top of the program, and then press the "Add Playlist" button. This can be repeated any number of times.
8. You can now see a list of playlists, auto-populating on the screen. These entries can be searched through via the search bar at the top left of your screen.

### Please Also Note

After adding new playlists, you will need to refresh the application in order for those elements to be correctly ordered among pre-existing ones.
