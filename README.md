# 🧾 Your Life, In Receipts

> **Every purchase tells a story. Discover yours.**  
> A client-side visual analytics and storytelling web application that turns raw transaction data and streaming history into an interactive, Spotify-Wrapped-style personal narrative.

---

## 📖 Executive Summary

**“Your Life, In Receipts”** bridges the gap between cold, dry financial spreadsheets and compelling visual storytelling. Instead of simply presenting expense lists, it reveals the lifestyle patterns, habits, and chapters of a person’s life:

* **Where does your capital or time flow?**
* **Which creators, merchants, or establishments dominate your daily rhythm?**
* **How does your activity fluctuate across days, weeks, and seasons?**
* **What hidden habits and milestones define your year?**

The application operates as a **100% private, client-side web application** built with pure **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. No frameworks (No React, Vue, Angular), no server backend (No Node.js, Python server, or PHP), and no external database are required. All calculations, parsing, and chart rendering happen directly in your browser's local memory.

---

## 🛠️ Technology Stack & Architecture

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Structure** | Semantic HTML5 | Accessible, SEO-optimized markup with structured headings, ARIA attributes, and responsive layout containers. |
| **Styling** | Vanilla CSS3 | Custom CSS variables for theme tokens (Dark & Light modes), glassmorphism (`backdrop-filter`), ambient neon glow meshes, responsive Grid & Flexbox, and specialized `@media print` rules. |
| **Logic & Engine** | Vanilla JavaScript (ES6+) | Modular architecture handling file reading via the HTML5 `FileReader` API, CSV/JSON stream parsing, high-DPI Canvas graphics, multi-dataset management, and heuristic classification. |
| **Visualizations** | HTML5 Canvas API | High-DPI (retina-sharp) custom Canvas line charts with cubic Bezier curves, glowing gradient fills, crosshair mouse tracking, and custom donut charts with interactive legends. |
| **Dependencies** | **Zero (0)** | Completely self-contained. No external libraries, no CDNs required for execution, no tracking scripts. |

---

## 📂 Multi-Dataset Engine & Data Ingestion

The application is engineered to ingest, parse, and analyze diverse tabular datasets:

### 1. Multi-File Simultaneous Upload & Merging
* **Bulk Upload**: Select or drag & drop multiple files simultaneously (e.g. `Streaming_History_0.json`, `Streaming_History_1.json`, or multiple monthly CSV statements).
* **Upload Modes**:
  * **Merge & Combine**: Merges records into a unified dataset and deduplicates overlapping rows based on timestamps, merchants, items, and values.
  * **Keep as Separate Datasets**: Preserves each file as an individual dataset for isolated comparison.
  * **Replace All**: Wipes previous sessions and loads fresh data.
* **Instant Dataset Switcher**: A sticky toolbar dropdown allows toggling between **"✨ Combined All Files"** or viewing any individual file with a single click.
* **Dataset Manager Modal**: Inspect all loaded files, view individual record counts, activate files, or delete unwanted sets.

### 2. Dual Dataset Mode: Financial Receipts & Spotify Streaming History

The system automatically distinguishes between traditional purchase receipts and multimedia history:

#### A. Standard Purchase Receipts
* Supported columns: `date`, `merchant`, `amount`, `category`, `item`, `quantity`, `payment_method`, `location`.
* Formats currency as **`₹` (INR)** with localized Indian numbering formatting.
* Automatically auto-categorizes items into Food, Shopping, Transport, Travel, Entertainment, Tech, Fitness, and Essentials based on keyword detection.

#### B. Spotify Extended Streaming History
* Detects standard Spotify fields: `spotify_track_uri`, `ts`, `platform`, `ms_played`, `track_name`, `artist_name`, `album_name`, `reason_start`, `reason_end`, `shuffle`, `skipped`.
* **Adaptive Unit Conversion**: Automatically converts `ms_played` (milliseconds) into **minutes** or **hours**.
* **Dynamic Terminology**:
  * *Total Spending* ➔ **Total Listening Duration**
  * *Transactions* ➔ **Tracks Streamed**
  * *Average Receipt* ➔ **Average Track Length**
  * *Top Merchant* ➔ **Top Streamed Artist**
  * *Top Category* ➔ **Top Streamed Album**
  * *Where Your Money Goes* ➔ **Top Streamed Artists Leaderboard**

### 3. Interactive Column Mapping Fallback
If an uploaded file uses unrecognized column names, the application opens a visual **Column Mapping Modal**, allowing users to map their custom columns to core attributes in one click.

---

## 🧩 Core Dashboard Features & Sections

### 1. Landing Hero & Floating Receipt Visual
* Eye-catching hero section featuring an ambient glow mesh, gradient typography, and quick-action buttons: **Explore My Life**, **Upload Dataset**, and **Try Demo Data**.
* An authentic **floating thermal receipt illustration** with realistic jagged zigzag tear borders, dashed dividers, itemized rows, and barcodes.
* **Live Dataset Status Banner**: Shows loaded transaction count, date range, total spend/listening time, distinct merchants/artists, and categories/albums.

### 2. Global Filter & Search Control Toolbar
* **Sticky Navigation Bar**: Always accessible while scrolling through data.
* **Global Search**: Debounced instant search querying across merchants, items, categories, platforms, and locations.
* **Timeframe Presets**: All Time, This Year, This Month, Last 30 Days, or Custom Date Picker range.
* **Multi-Dropdown Filtering**: Filter simultaneously by Category, Merchant, and Payment Method.
* **Export Engine**:
  * **Download Filtered Data**: Export active subsets as clean CSV or JSON files.
  * **Export Printable Report**: Invokes customized print layout (`window.print()`).

### 3. KPI Analytics Cards
Six animated metric cards with visual progress bars:
1. **Total Spending / Listening Duration** (Animated numerical counter)
2. **Total Transactions / Streams Recorded**
3. **Average Receipt Size / Track Duration**
4. **Most Frequent Merchant / Top Artist**
5. **Top Category / Top Album**
6. **Highest Spending / Peak Listening Day**

### 4. "Your Year in Receipts" (Annual Story Recap)
Inspired by viral annual recap experiences:
* **Year Selector**: Switch between specific calendar years or view an all-time aggregate.
* **Total Volume Card**: Giant typography showing overall expenditure/playtime and total milestone count.
* **Lifestyle Pillars**: Highlights key distributions across Food & Dining, Shopping, and Travel.
* **Hall of Fame**: Features the most expensive month, favorite category, and most visited storefront/artist.
* **Personality Narrative Quote**: Synthesizes a contextual personal quote summarizing the user's lifestyle profile.

### 5. Interactive Spending & Activity Canvas Chart
* Pure HTML5 Canvas line/area chart optimized for high-DPI retina screens.
* Smooth cubic Bezier spline with gradient area fill.
* Interval toggle: **Daily**, **Weekly**, **Monthly**.
* Interactive crosshair cursor with a floating glassmorphism tooltip showing the date, total volume, and top itemized category breakdown for that point.

### 6. Category & Album Donut Breakdown
* Custom Canvas donut visualization with hover effects and responsive radius calculations.
* Interactive category legend displaying percentages, spend/listening totals, and color-coded dots.
* **Click-to-Filter**: Clicking any category pill isolates that category across the entire dashboard.

### 7. Merchant & Creator Leaderboard ("Where Your Money Goes")
* Ranks top merchants or artists by total volume.
* Includes relative percentage visual fill bars and transaction/stream frequency tags.
* Clicking any merchant row filters the entire dashboard to that merchant.

### 8. AI-Style Algorithmic Insights Feed
Rule-based heuristic intelligence engine running locally in JavaScript:
* **Day-of-Week Rhythm**: Detects the highest outflow day of the week (e.g. *"Saturday is your highest-spending day"*).
* **Weekend vs. Weekday Analysis**: Quantifies leisure vs. workday spending/listening ratios.
* **Dominant Category Share**: Identifies category concentration percentages.
* **Merchant Loyalty**: Highlights repeat visit counts to top venues.
* **Checkout Size Average**: Evaluates typical transaction baskets.
* **Seasonal Outflow Spikes**: Detects peak calendar months.

### 9. Life Milestones Timeline
* Chronological storytelling timeline grouping records by Month and Year.
* Shows monthly cumulative volume, category icons, and clickable transaction pills for notable moments.

### 10. Searchable & Sortable Transaction Table
* Itemized tabular view with column sorting (Date, Merchant, Category, Amount).
* Custom pagination controls with selectable page sizes (10, 25, 50, 100).
* **Mobile-Responsive Card Transformation**: On mobile devices (`<= 768px`), table rows transform into touch-friendly cards.

### 11. Realistic Thermal Receipt Modal
Clicking any transaction in the table or timeline opens a detailed digital cash register receipt:
* Thermal receipt aesthetic with zigzag top and bottom cuts.
* Merchant name, verified timestamp, store location, and category badge.
* Itemized product breakdown with quantities, unit prices, subtotal, taxes, and grand total.
* Payment method verification, unique reference ID, and barcode graphic.
* Built-in **"Print Receipt"** button formatted for thermal or standard printers.

### 12. Privacy Guarantee & Local Storage Persistence
* **100% Client-Side Guarantee**: No network requests to external servers. Data stays strictly in memory.
* **Theme Preference**: Dark and Light theme toggle stored in `localStorage`.

---

## 🚀 Running the Project Locally

No installation, build tools, or runtime dependencies are required:

### Option 1: Direct File Execution
Navigate to the project folder and double-click:
```text
c:\Users\atul9\Desktop\my\index.html
```
The application opens instantly in your default web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Localhost HTTP Server
If running via a local development server:
```powershell
# Inside c:\Users\atul9\Desktop\my
python -m http.server 8080
```
Then visit **`http://localhost:8080`** in your browser.

---

## 📋 File Layout

```text
c:\Users\atul9\Desktop\my\
├── index.html        # Main semantic HTML structure & modal layouts
├── style.css         # Complete CSS3 design system, responsive styles & print rules
├── script.js         # Core application logic, chart rendering & dataset engine
└── README.md         # Full project technical documentation
```
