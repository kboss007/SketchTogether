document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const canvas = new fabric.Canvas('canvas', {
        backgroundColor: 'white',
        isDrawingMode: true
    });
    let currentRoom = null;

    /**
     * Updates the brush settings
     */
    function updateBrushSettings() {
        var brushSize = parseInt(document.getElementById('brushSize').value, 10);
        var color = document.getElementById('colorPicker').value;

        if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = brushSize;
            if (canvas.freeDrawingBrush.color !== 'white') {
                canvas.freeDrawingBrush.color = color;
            }
        }
    }

    /**
     * Adds or removes event listeners from the canvas
     */
    function updateCanvasBasedOnRoom() {
        canvas.off('path:created object:modified');
        if (currentRoom) {
            canvas.on('path:created', function(event) {
                const path = event.path;
                let details = `drew a path with color ${path.stroke} and width ${path.strokeWidth}`;
                if (path.stroke === 'white') {
                    details = 'used eraser tool';
                }
                socket.emit('canvas_change', {
                    room: currentRoom,
                    canvas: canvas.toJSON(),
                    details: details
                });
            });

            canvas.on('object:modified', function(event) {
                const object = event.target;
                let details = `modified an object`;
                socket.emit('canvas_change', {
                    room: currentRoom,
                    canvas: canvas.toJSON(),
                    details: details
                });
            });
        }
    }

    /**
     * Handles user joining a room
     */
    document.getElementById('joinRoom').addEventListener('click', function() {
        const room = document.getElementById('roomName').value;
        if (room && room !== currentRoom) {
            if (currentRoom) {
                socket.emit('leave', {room: currentRoom});
            }
            currentRoom = room;
            socket.emit('join', {room: room});
            document.getElementById('currentRoom').textContent = `Current Room: ${room}`;
            canvas.clear();
            canvas.backgroundColor = 'white';
            canvas.renderAll();
            updateCanvasBasedOnRoom();
        }
    });

    /**
     * Handles user leaving a room
     */
    document.getElementById('leaveRoom').addEventListener('click', function() {
        if (currentRoom) {
            socket.emit('leave', {room: currentRoom});
            document.getElementById('currentRoom').textContent = '';
            currentRoom = null;
            canvas.clear();
            canvas.backgroundColor = 'white';
            canvas.renderAll();
            updateCanvasBasedOnRoom();
        }
    });

    document.getElementById('brushSize').addEventListener('change', updateBrushSettings);
    document.getElementById('brushSize').addEventListener('input', updateBrushSettings);
    document.getElementById('colorPicker').addEventListener('change', updateBrushSettings);

    /**
     * Clears the canvas and emits the change to other clients
     */
    const clearButton = document.getElementById('clear');
    clearButton.addEventListener('click', function() {
        canvas.clear();
        canvas.backgroundColor = 'white';
        canvas.renderAll();
        if (currentRoom) {
            socket.emit('canvas_change', {
                room: currentRoom,
                canvas: {objects: [], background: 'white'},
                details: 'cleared the canvas'
            });
        }
    });

    /**
     * Activates eraser tool
     */
    const eraserButton = document.getElementById('eraser');
    eraserButton.addEventListener('click', function() {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = 'white';
        canvas.freeDrawingBrush.width = parseInt(document.getElementById('brushSize').value, 10);
    });

    /**
     * Activates the pen tool
     */
    const penButton = document.getElementById('pen');
    penButton.addEventListener('click', function() {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        updateBrushSettings();
    });

    /**
     * Activates the move tool
     */
    const moveButton = document.getElementById('move');
    moveButton.addEventListener('click', () => {
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.forEachObject((obj) => {
            obj.selectable = true;
        });
    });

    /**
     * Receives the current state of the canvas
     */
    socket.on('canvas_state', function(data) {
        canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
    });

    /**
     * Receives and logs changes made in the room
     */
    socket.on('edit_log', function(data) {
        const logElement = document.getElementById('editLog');
        const entry = document.createElement('li');
        entry.textContent = `${data.user}: ${data.message}`;
        logElement.appendChild(entry);
        logElement.scrollTop = logElement.scrollHeight;
    });

    updateCanvasBasedOnRoom();
});
