import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

waiting_player = None
rooms = {}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    global waiting_player
    sid = request.sid
    print(f"Người chơi kết nối: {sid}")

    if waiting_player is None:
        waiting_player = sid
        emit('waiting', {'msg': 'Đang chờ người chơi khác...'}, to=sid)
    else:
        room_id = f"{waiting_player}_{sid}"
        join_room(room_id, sid)
        join_room(room_id, waiting_player)

        rooms[room_id] = {
            "players": [waiting_player, sid],
            "choices": {}
        }

        emit('start', {'msg': 'Đã ghép cặp! Bắt đầu chơi.'}, room=room_id)
        waiting_player = None

@socketio.on('player_choice')
def handle_choice(data):
    sid = request.sid
    choice = data.get('choice')

    room_id = None
    for rid, room in rooms.items():
        if sid in room['players']:
            room_id = rid
            break

    if room_id is None:
        return

    rooms[room_id]['choices'][sid] = choice

    if len(rooms[room_id]['choices']) == 2:
        p1, p2 = rooms[room_id]['players']
        c1 = rooms[room_id]['choices'][p1]
        c2 = rooms[room_id]['choices'][p2]

        winner = get_winner(c1, c2)
        socketio.emit('round_result', {
            'p1_choice': c1,
            'p2_choice': c2,
            'winner': winner
        }, room=room_id)

        rooms[room_id]['choices'] = {}

@socketio.on('disconnect')
def handle_disconnect():
    global waiting_player
    sid = request.sid
    print(f"Người chơi thoát kết nối: {sid}")

    if waiting_player == sid:
        waiting_player = None

    for rid, room in list(rooms.items()):
        if sid in room['players']:
            socketio.emit('player_left', {'msg': 'Người chơi rời game!'}, room=rid)
            del rooms[rid]
            break

def get_winner(c1, c2):
    if c1 == c2:
        return "draw"
    if (c1 == "r" and c2 == "s") or (c1 == "s" and c2 == "p") or (c1 == "p" and c2 == "r"):
        return "player1"
    return "player2"

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
