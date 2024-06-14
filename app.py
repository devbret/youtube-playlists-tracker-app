from flask import Flask, jsonify, render_template, request
import json
import os

app = Flask(__name__)

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
    return render_template('index.html')

@app.route('/api/playlists', methods=['GET', 'POST'])
def playlists():
    if request.method == 'GET':
        playlists = load_playlists()
        sorted_playlists = sort_playlists(playlists['playlists'])
        playlists['playlists'] = sorted_playlists
        return jsonify(playlists)
    elif request.method == 'POST':
        new_playlist = request.json
        playlists = load_playlists()
        playlists['playlists'].append(new_playlist)
        playlists['playlists'] = sort_playlists(playlists['playlists'])
        save_playlists(playlists)
        return jsonify({"success": True}), 200

@app.route('/api/playlists/<int:index>', methods=['PUT'])
def update_playlist(index):
    new_video_number = request.json.get('video_number')
    playlists = load_playlists()
    if 0 <= index < len(playlists['playlists']):
        playlists['playlists'][index]['video_number'] = new_video_number
        save_playlists(playlists)
        return jsonify({"success": True}), 200
    return jsonify({"success": False, "error": "Invalid index"}), 400

@app.route('/api/playlists/<int:index>', methods=['DELETE'])
def delete_playlist(index):
    playlists = load_playlists()
    if 0 <= index < len(playlists['playlists']):
        playlists['playlists'].pop(index)
        save_playlists(playlists)
        return jsonify({"success": True}), 200
    return jsonify({"success": False, "error": "Invalid index"}), 400

if __name__ == '__main__':
    app.run(debug=True)
