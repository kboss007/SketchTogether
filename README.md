# SketchTogether - Collaborative Whiteboard

**Version:** 1.0  
**Developers:** Kunal Singh, Pranav Agrawala  
**Date:** May 16, 2024  

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Contributing](#contributing)
6. [License](#license)
7. [Contact](#contact)

---

## Project Overview
**SketchTogether** is a real-time collaborative whiteboard application designed to facilitate virtual collaboration for teams. It allows users to join rooms and sketch together seamlessly, updating the whiteboard in real time. This solution addresses common problems in virtual teamwork, such as disorganized communication and unsynchronized brainstorming.

## Features
- Real-time whiteboard collaboration
- Room-based sessions for organized collaboration
- Multiple drawing tools including pen, eraser, and move tool
- Customizable pen color and size
- Whiteboard clearing functionality

## Installation
### System Requirements
- Python installed on your computer. [Download Python](https://www.python.org/downloads/)
- A web browser for accessing the whiteboard (e.g., Chrome, Firefox).

### Installation Steps
1. Unzip the provided SketchTogether ZIP file.
2. Open Terminal and navigate to the unzipped project folder.
3. Set up a virtual environment:
python -m venv venv

4. Activate the virtual environment:
- On macOS/Linux:
  ```
  source venv/bin/activate
  ```
- On Windows:
  ```
  venv\Scripts\activate
  ```
5. Install dependencies:
pip install -r requirements.txt

## Usage
### Starting the Server
1. Open Terminal.
2. Navigate to the project folder where the `app.py` file is located.
3. Activate the virtual environment:
source venv/bin/activate

4. Start the server:
python app.py


5. Share your IPv4 address with other users to allow them to connect to the whiteboard.

### Connecting to the Server
1. Open a web browser.
2. Enter the following URL: <IPv4 Address>:5001

Replace `<IPv4 Address>` with the address of the server. If running locally, use `127.0.0.1:5001`.

### Using the Whiteboard
- **Login**: Create an account or log in with existing credentials.
- **Join/Create Room**: Enter a room name to join an existing room or create a new one.
- **Sketching Tools**:
- **Pen Tool**: Draw on the whiteboard.
- **Move Tool**: Move sketches around.
- **Eraser Tool**: Erase parts of drawings.
- **Customization**: Adjust pen and eraser sizes with a slider, and change pen color.
- **Clear Board**: Clear all content on the whiteboard.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

## Contact
For any questions or support, please contact the developers:
- Pranav Agrawala
- Kunal Singh
