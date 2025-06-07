# Water Usage Dashboard

This is a responsive web dashboard for tracking daily water usage, goals, and tips. All data is loaded dynamically from a `data.json` file for easy updates.

## Features
- Interactive, responsive water usage chart
- Daily goal ring and personalized tips
- Data-driven: update `data.json` to change usage, tips, or goals

## Getting Started

### 1. Clone or Download the Project
Download or clone this repository to your local machine.

### 2. **Important:** Run a Local Server

Modern browsers block `fetch` requests to local files for security reasons. If you open `index.html` directly, the chart and data will **not** load.

**To run the app correctly:**

#### Using Python (recommended, already installed on most systems)

1. Open your terminal.
2. Navigate to the project directory:
   ```sh
   cd /path/to/your/project
   ```
3. Start a local server:
   ```sh
   python3 -m http.server 8000
   ```
4. Open your browser and go to:
   [http://localhost:8000](http://localhost:8000)

#### Using Node.js (alternative)
1. Install http-server globally (if you haven't):
   ```sh
   npm install -g http-server
   ```
2. Start the server:
   ```sh
   http-server -p 8000
   ```
3. Open your browser and go to:
   [http://localhost:8000](http://localhost:8000)

---

## Customizing Data

Edit `data.json` to update:
- **goal**: Daily water usage goal (number)
- **days**: Array of day labels (e.g., ["S", "M", ...])
- **usage**: Array of daily usage values (litres)
- **tips**: Array of daily tips (strings)

Save your changes and refresh the browser to see updates.

---

## Troubleshooting
- If the chart does not load, make sure you are running a local server and accessing the app via `http://localhost:8000` (not `file://`).
- If you change the port, update the URL accordingly.

---

## License
MIT 