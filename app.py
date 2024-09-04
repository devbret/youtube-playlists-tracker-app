from flask import Flask, jsonify, render_template, request, send_from_directory
import json
import os
import logging
import csv
import time

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

@app.before_request
def log_request_info():
    logging.info(f"Incoming request: {request.method} {request.url} from {request.remote_addr}")
    logging.debug(f"Request headers: {request.headers}")
    logging.debug(f"Request body: {request.get_data()}")

@app.after_request
def log_response_info(response):
    logging.info(f"Response status: {response.status_code} for {request.method} {request.url}")
    if not response.direct_passthrough:
        logging.debug(f"Response size: {len(response.get_data())} bytes")
    else:
        logging.debug("Response is in direct passthrough mode; size logging skipped.")
    return response

def load_playlists():
    logging.debug("Loading playlists from playlists.json")
    if not os.path.exists('playlists.json'):
        logging.debug("playlists.json not found, creating a new one.")
        save_playlists({'playlists': []})
    with open('playlists.json') as f:
        playlists = json.load(f)
    logging.debug(f"Loaded {len(playlists['playlists'])} playlists")
    return playlists

def save_playlists(playlists):
    logging.debug(f"Saving {len(playlists['playlists'])} playlists to playlists.json")
    with open('playlists.json', 'w') as f:
        json.dump(playlists, f, indent=4)
    logging.debug("Playlists saved successfully.")

def sort_playlists(playlists):
    logging.debug("Sorting playlists")
    sorted_playlists = sorted(playlists, key=lambda x: (x['game'].lower(), x['youtuber'].lower()))
    logging.debug("Playlists sorted successfully.")
    return sorted_playlists

@app.route('/')
def index():
    logging.info('Accessed home page.')
    return render_template('index.html')

@app.route('/network')
def network():
    logging.info('Accessed network graph page.')
    return render_template('network.html')

@app.route('/analytics')
def analytics():
    logging.info('Accessed analytics page.')
    return render_template('analytics.html')

@app.route('/data/<filename>')
def get_csv(filename):
    logging.info(f"Serving CSV file: {filename}")
    return send_from_directory(os.path.abspath(os.path.dirname(__file__)), filename)

@app.route('/api/playlists.json')
def get_playlists_json():
    logging.info("Serving playlists.json file")
    return send_from_directory('.', 'playlists.json')

@app.route('/api/search_log', methods=['POST'])
def log_search():
    search_data = request.json
    search_term = search_data.get('search_term', '')
    logging.info(f"Search term used: {search_term}")
    return jsonify({"success": True}), 200

@app.route('/api/playlists', methods=['GET', 'POST'])
def playlists():
    start_time = time.time()
    if request.method == 'GET':
        playlists = load_playlists()
        sorted_playlists = sort_playlists(playlists['playlists'])
        playlists['playlists'] = sorted_playlists
        logging.info(f"GET request to /api/playlists, returning {len(playlists['playlists'])} playlists")
        response = jsonify(playlists)
    elif request.method == 'POST':
        new_playlist = request.json
        logging.info(f"POST request to /api/playlists with new playlist data: {new_playlist['game']} by {new_playlist['youtuber']}")
        playlists = load_playlists()
        playlists['playlists'].append(new_playlist)
        playlists['playlists'] = sort_playlists(playlists['playlists'])
        save_playlists(playlists)
        logging.info(f"Added new playlist: {new_playlist['game']} by {new_playlist['youtuber']}")
        response = jsonify({"success": True}), 200

    end_time = time.time()
    logging.debug(f"Processing time for /api/playlists: {end_time - start_time:.4f} seconds")
    return response

@app.route('/api/playlists/<int:index>', methods=['PUT'])
def update_playlist(index):
    start_time = time.time()
    new_video_number = request.json.get('video_number')
    playlists = load_playlists()
    if 0 <= index < len(playlists['playlists']):
        old_video_number = playlists['playlists'][index]['video_number']
        playlists['playlists'][index]['video_number'] = new_video_number
        save_playlists(playlists)
        logging.info(f"Updated playlist '{playlists['playlists'][index]['game']}' by '{playlists['playlists'][index]['youtuber']}' at index {index} from video number {old_video_number} to {new_video_number}")
        response = jsonify({"success": True}), 200
    else:
        logging.warning(f"Invalid index {index} for PUT request to /api/playlists")
        response = jsonify({"success": False, "error": "Invalid index"}), 400

    end_time = time.time()
    logging.debug(f"Processing time for PUT /api/playlists/{index}: {end_time - start_time:.4f} seconds")
    return response

@app.route('/api/playlists/<int:index>', methods=['DELETE'])
def delete_playlist(index):
    start_time = time.time()
    playlists = load_playlists()
    if 0 <= index < len(playlists['playlists']):
        deleted_playlist = playlists['playlists'].pop(index)
        save_playlists(playlists)
        logging.info(f"Deleted playlist '{deleted_playlist['game']}' by '{deleted_playlist['youtuber']}' at index {index}")
        response = jsonify({"success": True}), 200
    else:
        logging.warning(f"Invalid index {index} for DELETE request to /api/playlists")
        response = jsonify({"success": False, "error": "Invalid index"}), 400

    end_time = time.time()
    logging.debug(f"Processing time for DELETE /api/playlists/{index}: {end_time - start_time:.4f} seconds")
    return response

@app.route('/api/playlists/delete_by_game', methods=['DELETE'])
def delete_playlists_by_game():
    start_time = time.time()
    data = request.json
    game = data.get('game')

    if not game:
        logging.warning("DELETE request to /api/playlists/delete_by_game with missing game parameter")
        return jsonify({"success": False, "error": "Missing game"}), 400

    playlists = load_playlists()
    initial_length = len(playlists['playlists'])
    playlists['playlists'] = [p for p in playlists['playlists'] if p['game'] != game]

    if len(playlists['playlists']) < initial_length:
        save_playlists(playlists)
        logging.info(f"Deleted playlists for game '{game}'")
        response = jsonify({"success": True}), 200
    else:
        logging.warning(f"No matching playlists found for game '{game}'")
        response = jsonify({"success": False, "error": "No matching playlists found"}), 400

    end_time = time.time()
    logging.debug(f"Processing time for DELETE /api/playlists/delete_by_game: {end_time - start_time:.4f} seconds")
    return response

@app.errorhandler(404)
def page_not_found(e):
    logging.error(f"404 error occurred: {e}")
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_server_error(e):
    logging.error(f"500 error occurred: {e}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=5500)
