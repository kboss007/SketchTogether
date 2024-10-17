from flask import Flask, render_template, request, session, redirect, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room
import sqlite3
import hashlib
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

canvases = {}
edit_logs = {}

def init_db():
    """Initialize the database and create the users table"""
    with sqlite3.connect('sketchtogether.db') as db:
        db.execute('''
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY,
            username TEXT,
            password TEXT,
            salt TEXT
        )
        ''')
        db.commit()

def hash_password(password, salt=None):
    """
    Hashes a password with a salt. If no salt is given, generates a new one.
    
    Args:
        password (str): The password to hash
        salt (bytes): Salt in bytes. If None, a new salt is generated.
    
    Returns:
        tuple: A tuple with the hashed password and the hex representation of the salt
    """
    if salt is None:
        salt = os.urandom(16)  # Generate a new salt (16 bytes)
    sha256 = hashlib.sha256()
    sha256.update(salt + password.encode('utf-8'))
    hashed_pw = sha256.hexdigest()
    return hashed_pw, salt.hex()

@app.route('/')
def index():
    """Renders the main page if logged in, otherwise redirect to login page"""
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """
    Processes login request
    """
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        with sqlite3.connect('sketchtogether.db') as db:
            cursor = db.cursor()
            cursor.execute('SELECT password, salt FROM users WHERE username = ?', (username,))
            user = cursor.fetchone()
            if user:
                stored_hash, salt = user
                hashed_password, _ = hash_password(password, bytes.fromhex(salt))
                if hashed_password == stored_hash:
                    session['logged_in'] = True
                    session['username'] = username
                    return redirect(url_for('index'))
        return 'Login Failed'
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """
    Processes signup request
    """
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password, salt = hash_password(password)
        with sqlite3.connect('sketchtogether.db') as db:
            cursor = db.cursor()
            cursor.execute('INSERT INTO users (username, password, salt) VALUES (?, ?, ?)', (username, hashed_password, salt))
            db.commit()
        return redirect(url_for('login'))
    return render_template('signup.html')

@app.route('/logout')
def logout():
    """
    Logs out current user and redirects to login page
    """
    session.pop('logged_in', None)
    session.pop('username', None)
    return redirect(url_for('login'))

@socketio.on('join')
def on_join(data):
    """
    Handles user joining a room
    
    Args:
        data (dict): Contains the room information
    """
    room = data['room']
    join_room(room)
    session['room'] = room
    if room in canvases:
        emit('canvas_state', canvases[room], room=request.sid)
    else:
        canvases[room] = {'objects': [], 'background': 'white'}
    if room not in edit_logs:
        edit_logs[room] = []

@socketio.on('leave')
def on_leave(data):
    """
    Handles user leaving a room
    
    Args:
        data (dict): Contains the room information
    """
    room = data['room']
    leave_room(room)
    session.pop('room', None)

@socketio.on('canvas_change')
def handle_canvas_change(data):
    """
    Processes canvas changes and broadcasts the changes
    
    Args:
        data (dict): Contains the canvas data and the room to broadcast the changes
    """
    room = data['room']
    username = session.get('username', 'Anonymous')
    detail = data.get('details', 'made unspecified changes')
    log_entry = f"{username} {detail}"
    
    canvases[room] = data['canvas']
    edit_logs[room].append(log_entry)
    emit('canvas_state', data['canvas'], room=room, include_self=False)
    emit('edit_log', {'user': username, 'message': log_entry}, room=room)

if __name__ == '__main__':
    init_db()
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
