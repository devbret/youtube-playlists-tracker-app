from flask import Flask, jsonify, render_template, request, send_from_directory
import json
import math
import os
import logging
import csv
import threading
import time
import uuid

app = Flask(__name__)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PLAYLISTS_FILE = os.path.join(BASE_DIR, 'playlists.json')
LOG_FILE = os.path.join(BASE_DIR, 'app_log.csv')

playlists_lock = threading.Lock()

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

handler = CustomCSVFileHandler(LOG_FILE)
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

def normalize_playlists(playlists):
    changed = False
    for playlist in playlists:
        if not playlist.get('id'):
            playlist['id'] = uuid.uuid4().hex
            changed = True
        video_number = playlist.get('video_number')
        if not isinstance(video_number, (int, float)):
            parsed = parse_video_number(video_number)
            if parsed is not None:
                playlist['video_number'] = parsed
                changed = True
    return changed

def load_playlists():
    logging.debug("Loading playlists from playlists.json")
    if not os.path.exists(PLAYLISTS_FILE):
        logging.debug("playlists.json not found, creating a new one.")
        save_playlists({'playlists': []})
    with open(PLAYLISTS_FILE) as f:
        playlists = json.load(f)
    if normalize_playlists(playlists['playlists']):
        logging.info("Normalized playlists: assigned missing ids and coerced video numbers.")
        save_playlists(playlists)
    logging.debug(f"Loaded {len(playlists['playlists'])} playlists")
    return playlists

def save_playlists(playlists):
    logging.debug(f"Saving {len(playlists['playlists'])} playlists to playlists.json")
    temp_file = PLAYLISTS_FILE + '.tmp'
    with open(temp_file, 'w') as f:
        json.dump(playlists, f, indent=4)
    os.replace(temp_file, PLAYLISTS_FILE)
    logging.debug("Playlists saved successfully.")

def sort_playlists(playlists):
    logging.debug("Sorting playlists")
    sorted_playlists = sorted(playlists, key=lambda x: (x['game'].lower(), x['youtuber'].lower()))
    logging.debug("Playlists sorted successfully.")
    return sorted_playlists

def find_playlist(playlists, playlist_id):
    return next((p for p in playlists['playlists'] if p.get('id') == playlist_id), None)

def parse_video_number(value):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(number):
        return None
    return int(number) if number.is_integer() else number

def validate_playlist(data):
    if not isinstance(data, dict):
        return None, "Request body must be a JSON object"
    for field in ('game', 'youtuber', 'link'):
        value = data.get(field)
        if not isinstance(value, str) or not value.strip():
            return None, f"'{field}' is required and must be a non-empty string"
    link = data['link'].strip()
    if not link.startswith(('http://', 'https://')):
        return None, "'link' must be an http:// or https:// URL"
    video_number = parse_video_number(data.get('video_number', 1))
    if video_number is None:
        return None, "'video_number' must be a number"
    return {
        'game': data['game'].strip(),
        'video_number': video_number,
        'youtuber': data['youtuber'].strip(),
        'link': link,
    }, None

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

@app.route('/data/app_log.csv')
def get_log_csv():
    logging.info("Serving CSV file: app_log.csv")
    return send_from_directory(BASE_DIR, 'app_log.csv')

@app.route('/api/search_log', methods=['POST'])
def log_search():
    search_data = request.get_json(silent=True) or {}
    search_term = search_data.get('search_term', '')
    logging.info(f"Search term used: {search_term}")
    return jsonify({"success": True}), 200

@app.route('/api/playlists', methods=['GET', 'POST'])
def playlists():
    start_time = time.time()
    if request.method == 'GET':
        with playlists_lock:
            playlists = load_playlists()
        playlists['playlists'] = sort_playlists(playlists['playlists'])
        logging.info(f"GET request to /api/playlists, returning {len(playlists['playlists'])} playlists")
        response = jsonify(playlists)
    elif request.method == 'POST':
        new_playlist, error = validate_playlist(request.get_json(silent=True))
        if new_playlist is None:
            logging.warning(f"Invalid POST request to /api/playlists: {error}")
            return jsonify({"success": False, "error": error}), 400
        new_playlist['id'] = uuid.uuid4().hex
        logging.info(f"POST request to /api/playlists with new playlist data: {new_playlist['game']} by {new_playlist['youtuber']}")
        with playlists_lock:
            playlists = load_playlists()
            playlists['playlists'].append(new_playlist)
            playlists['playlists'] = sort_playlists(playlists['playlists'])
            save_playlists(playlists)
        logging.info(f"Added new playlist: {new_playlist['game']} by {new_playlist['youtuber']}")
        response = jsonify({"success": True, "playlist": new_playlist}), 200

    end_time = time.time()
    logging.debug(f"Processing time for /api/playlists: {end_time - start_time:.4f} seconds")
    return response

@app.route('/api/playlists/<playlist_id>', methods=['PUT'])
def update_playlist(playlist_id):
    start_time = time.time()
    request_data = request.get_json(silent=True) or {}
    new_video_number = parse_video_number(request_data.get('video_number'))
    if new_video_number is None:
        logging.warning(f"Invalid video number for PUT request to /api/playlists/{playlist_id}")
        return jsonify({"success": False, "error": "'video_number' must be a number"}), 400

    with playlists_lock:
        playlists = load_playlists()
        playlist = find_playlist(playlists, playlist_id)
        if playlist:
            old_video_number = playlist['video_number']
            playlist['video_number'] = new_video_number
            save_playlists(playlists)

    if playlist:
        logging.info(f"Updated playlist '{playlist['game']}' by '{playlist['youtuber']}' with id {playlist_id} from video number {old_video_number} to {new_video_number}")
        response = jsonify({"success": True, "playlist": playlist}), 200
    else:
        logging.warning(f"Unknown playlist id {playlist_id} for PUT request to /api/playlists")
        response = jsonify({"success": False, "error": "Playlist not found"}), 404

    end_time = time.time()
    logging.debug(f"Processing time for PUT /api/playlists/{playlist_id}: {end_time - start_time:.4f} seconds")
    return response

@app.route('/api/playlists/<playlist_id>', methods=['DELETE'])
def delete_playlist(playlist_id):
    start_time = time.time()
    with playlists_lock:
        playlists = load_playlists()
        deleted_playlist = find_playlist(playlists, playlist_id)
        if deleted_playlist:
            playlists['playlists'].remove(deleted_playlist)
            save_playlists(playlists)

    if deleted_playlist:
        logging.info(f"Deleted playlist '{deleted_playlist['game']}' by '{deleted_playlist['youtuber']}' with id {playlist_id}")
        response = jsonify({"success": True}), 200
    else:
        logging.warning(f"Unknown playlist id {playlist_id} for DELETE request to /api/playlists")
        response = jsonify({"success": False, "error": "Playlist not found"}), 404

    end_time = time.time()
    logging.debug(f"Processing time for DELETE /api/playlists/{playlist_id}: {end_time - start_time:.4f} seconds")
    return response

@app.route('/api/playlists/delete_by_game', methods=['DELETE'])
def delete_playlists_by_game():
    start_time = time.time()
    data = request.get_json(silent=True) or {}
    game = data.get('game')

    if not game:
        logging.warning("DELETE request to /api/playlists/delete_by_game with missing game parameter")
        return jsonify({"success": False, "error": "Missing game"}), 400

    with playlists_lock:
        playlists = load_playlists()
        initial_length = len(playlists['playlists'])
        playlists['playlists'] = [p for p in playlists['playlists'] if p['game'] != game]
        deleted_any = len(playlists['playlists']) < initial_length
        if deleted_any:
            save_playlists(playlists)

    if deleted_any:
        logging.info(f"Deleted playlists for game '{game}'")
        response = jsonify({"success": True}), 200
    else:
        logging.warning(f"No matching playlists found for game '{game}'")
        response = jsonify({"success": False, "error": "No matching playlists found"}), 400

    end_time = time.time()
    logging.debug(f"Processing time for DELETE /api/playlists/delete_by_game: {end_time - start_time:.4f} seconds")
    return response

@app.route('/api/query_logs', methods=['POST'])
def query_logs():
    data = request.get_json(silent=True) or {}
    game_title = data.get('game')
    if not game_title:
        return jsonify({"success": False, "error": "No game title provided."}), 400

    game = game_title.lower()
    event_markers = [
        (f"added new playlist: {game} by ", "added"),
        (f"updated playlist '{game}' by ", "updated"),
        (f"deleted playlist '{game}' by ", "deleted"),
        (f"deleted playlists for game '{game}'", "bulk_deleted"),
    ]
    search_marker = "search term used: "

    results = []
    try:
        with open(LOG_FILE, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                message = row['Message'].lower()
                event = next(
                    (name for marker, name in event_markers if marker in message),
                    None,
                )
                if event is None and search_marker in message:
                    search_term = message.split(search_marker, 1)[1]
                    if game in search_term:
                        event = "searched"
                if event:
                    results.append({
                        "timestamp": row['Timestamp'],
                        "time": row['Time'],
                        "message": row['Message'],
                        "event": event,
                    })
    except Exception as e:
        logging.error(f"Error reading log file: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

    return jsonify({"success": True, "logs": results}), 200

@app.errorhandler(404)
def page_not_found(e):
    logging.error(f"404 error occurred: {e}")
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_server_error(e):
    logging.error(f"500 error occurred: {e}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG') == '1'
    app.run(debug=debug_mode, use_reloader=False, port=5500)
