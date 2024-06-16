from flask import Flask, jsonify, render_template, request
import json
import os
import logging
import csv

app = Flask(__name__)

class CustomCSVFileHandler(logging.Handler):
    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        if not os.path.exists(self.filename):
            with open(self.filename, 'w', newline='') as csvfile:
                csv_writer = csv.writer(csvfile)
                csv_writer.writerow(['Timestamp', 'Time', 'Message'])

    def emit(self, record):
        log_entry = self.format(record)
        timestamp, level, message = log_entry.split(' ', 2)
        with open(self.filename, 'a', newline='') as csvfile:
            csv_writer = csv.writer(csvfile)
            csv_writer.writerow([timestamp, level, message])

log_file = 'app_log.csv'
handler = CustomCSVFileHandler(log_file)
formatter = logging.Formatter('%(asctime)s %(levelname)s: %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
handler.setFormatter(formatter)
handler.setLevel(logging.INFO)
logging.getLogger().addHandler(handler)
logging.getLogger().setLevel(logging.INFO)

log = logging.getLogger('werkzeug')
log.disabled = True

def load_playlists():
    if not os.path.exists('playlists.json'):
        save_playlists({'playlists': []})
    with open('playlists.json') as f:
        playlists = json.load(f)
    return playlists

def save_playlists(playlists):
    with open('playlists.json', 'w') as f:
        json.dump(playlists, f, indent=4)

def sort_playlists(playlists):
    return sorted(playlists, key=lambda x: (x['game'].lower(), x['youtuber'].lower()))

@app.route('/')
def index():
    logging.info('Accessed home page.')
    return render_template('index.html')

@app.route('/api/search_log', methods=['POST'])
def log_search():
    search_data = request.json
    search_term = search_data.get('search_term', '')
    logging.info(f"Search term used: {search_term}")
    return jsonify({"success": True}), 200

@app.route('/api/playlists', methods=['GET', 'POST'])
def playlists():
    if request.method == 'GET':
        playlists = load_playlists()
        sorted_playlists = sort_playlists(playlists['playlists'])
        playlists['playlists'] = sorted_playlists
        logging.info(f"GET request to /api/playlists, returning {len(playlists['playlists'])} playlists")
        return jsonify(playlists)
    elif request.method == 'POST':
        new_playlist = request.json
        logging.info(f"POST request to /api/playlists with new playlist data: {new_playlist['game']} by {new_playlist['youtuber']}")
        playlists = load_playlists()
        playlists['playlists'].append(new_playlist)
        playlists['playlists'] = sort_playlists(playlists['playlists'])
        save_playlists(playlists)
        logging.info(f"Added new playlist: {new_playlist['game']} by {new_playlist['youtuber']}")
        return jsonify({"success": True}), 200

@app.route('/api/playlists/<int:index>', methods=['PUT'])
def update_playlist(index):
    new_video_number = request.json.get('video_number')
    playlists = load_playlists()
    if 0 <= index < len(playlists['playlists']):
        old_video_number = playlists['playlists'][index]['video_number']
        playlists['playlists'][index]['video_number'] = new_video_number
        save_playlists(playlists)
        logging.info(f"Updated playlist '{playlists['playlists'][index]['game']}' by '{playlists['playlists'][index]['youtuber']}' at index {index} from video number {old_video_number} to {new_video_number}")
        return jsonify({"success": True}), 200
    logging.warning(f"Invalid index {index} for PUT request to /api/playlists")
    return jsonify({"success": False, "error": "Invalid index"}), 400

@app.route('/api/playlists/<int:index>', methods=['DELETE'])
def delete_playlist(index):
    playlists = load_playlists()
    if 0 <= index < len(playlists['playlists']):
        deleted_playlist = playlists['playlists'].pop(index)
        save_playlists(playlists)
        logging.info(f"Deleted playlist '{deleted_playlist['game']}' by '{deleted_playlist['youtuber']}' at index {index}")
        return jsonify({"success": True}), 200
    logging.warning(f"Invalid index {index} for DELETE request to /api/playlists")
    return jsonify({"success": False, "error": "Invalid index"}), 400

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
