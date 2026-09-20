/**
 * ==========================================================================
 * YOUR LIFE, IN RECEIPTS - CORE JAVASCRIPT APPLICATION
 * Pure Vanilla JavaScript (ES6+) • 100% Client-Side Processing • Zero Dependencies
 * ==========================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
   * 1. GLOBAL STATE & CONFIGURATION
   * -------------------------------------------------------------------------- */
  const state = {
    rawTransactions: [],       // All parsed transactions from source
    transactions: [],          // Active dataset (demo or user)
    filteredTransactions: [],  // Subset after applying filters & search
    isDemo: true,              // True when running demo dataset
    isSpotify: false,          // True when dataset is Spotify Streaming History
    unitMode: 'auto',          // 'auto', 'mins', 'currency'
    datasets: [],              // Multi-dataset storage
    activeDatasetId: 'demo',   // Currently active dataset id or 'all'
    detectedColumns: [],       // Headers detected in uploaded CSV/JSON
    pendingDataRows: [],       // Raw data rows waiting for column mapping
    
    // Active Filters
    filters: {
      search: '',
      dateRange: 'all',        // 'all', 'this-year', 'this-month', 'last-30', 'custom'
      startDate: null,
      endDate: null,
      category: 'all',
      merchant: 'all',
      paymentMethod: 'all',
    },

    // Table & Pagination
    table: {
      currentPage: 1,
      pageSize: 25,
      sortColumn: 'date',
      sortAsc: false,
    },

    // Charting State
    chartInterval: 'monthly',   // 'daily', 'weekly', 'monthly'
    hoveredDataPoint: null,
    
    // Annual Recap (Wrapped) Selected Year
    wrappedYear: 'all',
  };

  // Curated Category Icon & Color Mapping
  const CATEGORY_META = {
    'Food': { icon: '🍔', color: '#f59e0b', name: 'Food & Dining' },
    'Shopping': { icon: '🛍️', color: '#ec4899', name: 'Shopping' },
    'Transport': { icon: '🚗', color: '#06b6d4', name: 'Transport' },
    'Travel': { icon: '✈️', color: '#3b82f6', name: 'Travel & Trips' },
    'Entertainment': { icon: '🎮', color: '#8b5cf6', name: 'Entertainment' },
    'Essentials': { icon: '🏠', color: '#10b981', name: 'Essentials & Groceries' },
    'Tech': { icon: '💻', color: '#6366f1', name: 'Tech & Gadgets' },
    'Fitness': { icon: '🏋️', color: '#14b8a6', name: 'Fitness & Health' },
    'Utilities': { icon: '⚡', color: '#eab308', name: 'Bills & Utilities' },
    'Other': { icon: '📦', color: '#94a3b8', name: 'Other' },
  };

  /* --------------------------------------------------------------------------
   * 2. RICH DEMO DATASET
   * -------------------------------------------------------------------------- */
  const DEMO_TRANSACTIONS = [
    { date: '2026-03-20', merchant: 'Global Luxury Boutique', amount: 38500, category: 'Shopping', item: 'Swiss Horology Chronograph', quantity: 1, paymentMethod: 'Credit Card', location: 'Zurich, CH', lat: 12.9716, long: 77.5946, merch_lat: 47.3769, merch_long: 8.5417, type: 'Expense' },
    { date: '2026-03-18', merchant: 'Apple Store', amount: 24900, category: 'Tech', item: 'AirPods Pro 2 + Care', quantity: 1, paymentMethod: 'Credit Card', location: 'Bengaluru', lat: 12.9716, long: 77.5946, merch_lat: 12.9784, merch_long: 77.5996, type: 'Expense' },
    { date: '2026-03-15', merchant: 'Swiggy', amount: 840, category: 'Food', item: 'Truffles Burger & Pasta combo', quantity: 2, paymentMethod: 'UPI', location: 'Bengaluru', lat: 12.9716, long: 77.5946, merch_lat: 12.9352, merch_long: 77.6245, type: 'Expense' },
    { date: '2026-03-14', merchant: 'Starbucks Coffee', amount: 450, category: 'Food', item: 'Caramel Frappuccino', quantity: 1, paymentMethod: 'UPI', location: 'Indiranagar', type: 'Expense' },
    { date: '2026-03-12', merchant: 'Uber', amount: 380, category: 'Transport', item: 'Ride to Airport Terminal 2', quantity: 1, paymentMethod: 'UPI', location: 'Bengaluru', type: 'Expense' },
    { date: '2026-03-10', merchant: 'IndiGo Airlines', amount: 7800, category: 'Travel', item: 'Flight BLR -> DEL', quantity: 1, paymentMethod: 'Credit Card', location: 'Online', type: 'Expense' },
    { date: '2026-03-08', merchant: 'Zara', amount: 5490, category: 'Shopping', item: 'Linen Overshirt & Chinos', quantity: 2, paymentMethod: 'Credit Card', location: 'Phoenix Marketcity', type: 'Expense' },
    { date: '2026-03-05', merchant: 'Blinkit', amount: 1120, category: 'Essentials', item: 'Fresh berries, Greek yogurt, almond milk', quantity: 4, paymentMethod: 'UPI', location: 'Koramangala', type: 'Expense' },
    { date: '2026-03-02', merchant: 'Netflix', amount: 649, category: 'Entertainment', item: 'Premium 4K Monthly Plan', quantity: 1, paymentMethod: 'Credit Card', location: 'Subscription', type: 'Expense' },
    { date: '2026-03-01', merchant: 'Tech Systems Global', amount: 95000, category: 'Other', item: 'Monthly Direct Deposit Salary', quantity: 1, paymentMethod: 'Bank Wire', location: 'Direct Deposit', lat: 12.9716, long: 77.5946, merch_lat: 12.9716, merch_long: 77.5946, type: 'Income' },
    
    { date: '2026-02-28', merchant: 'Blue Tokai Coffee', amount: 390, category: 'Food', item: 'Cold Brew & Croissant', quantity: 2, paymentMethod: 'UPI', location: 'Koramangala' },
    { date: '2026-02-24', merchant: 'Amazon', amount: 3499, category: 'Shopping', item: 'Ergonomic Desk Mat & Cable Organizer', quantity: 2, paymentMethod: 'Amazon Pay UPI', location: 'Online' },
    { date: '2026-02-20', merchant: 'Zomato', amount: 980, category: 'Food', item: 'Meghana Foods Special Biryani', quantity: 2, paymentMethod: 'UPI', location: 'Bengaluru' },
    { date: '2026-02-18', merchant: 'Cult.fit', amount: 12500, category: 'Fitness', item: 'Cultpass Elite 6-Month Renewal', quantity: 1, paymentMethod: 'Credit Card', location: 'Bengaluru' },
    { date: '2026-02-14', merchant: 'Olive Beach Bistro', amount: 4800, category: 'Food', item: 'Valentine Dinner & Mocktails', quantity: 1, paymentMethod: 'Credit Card', location: 'Ashok Nagar' },
    { date: '2026-02-10', merchant: 'BookMyShow', amount: 1200, category: 'Entertainment', item: 'IMAX Tickets: Dune Part 2', quantity: 2, paymentMethod: 'UPI', location: 'PVR Nexus Mall' },
    { date: '2026-02-05', merchant: 'Reliance Fresh', amount: 2350, category: 'Essentials', item: 'Weekly Pantry Supplies & Olive Oil', quantity: 6, paymentMethod: 'Debit Card', location: 'Bengaluru' },
    { date: '2026-02-01', merchant: 'Spotify', amount: 119, category: 'Entertainment', item: 'Individual Premium Plan', quantity: 1, paymentMethod: 'UPI AutoPay', location: 'Subscription' },

    { date: '2026-01-28', merchant: 'Amazon', amount: 18500, category: 'Tech', item: 'Kindle Paperwhite 16GB + Leather Cover', quantity: 1, paymentMethod: 'Credit Card', location: 'Online' },
    { date: '2026-01-25', merchant: 'Swiggy', amount: 620, category: 'Food', item: 'Ramen Bowl & Gyoza', quantity: 1, paymentMethod: 'UPI', location: 'Indiranagar' },
    { date: '2026-01-20', merchant: 'Starbucks Coffee', amount: 410, category: 'Food', item: 'Pike Place Roast & Banana Loaf', quantity: 2, paymentMethod: 'UPI', location: 'Church Street' },
    { date: '2026-01-16', merchant: 'Uber', amount: 290, category: 'Transport', item: 'Premier Ride: Office to Home', quantity: 1, paymentMethod: 'UPI', location: 'Bengaluru' },
    { date: '2026-01-12', merchant: 'H&M', amount: 3999, category: 'Shopping', item: 'Merino Wool Knit Sweater', quantity: 1, paymentMethod: 'Credit Card', location: 'Brigade Road' },
    { date: '2026-01-08', merchant: 'Zepto', amount: 760, category: 'Essentials', item: 'Avocados, sourdough bread & eggs', quantity: 3, paymentMethod: 'UPI', location: 'Bengaluru' },
    { date: '2026-01-03', merchant: 'Third Wave Coffee', amount: 520, category: 'Food', item: 'Vanilla Oat Latte & Biscotti', quantity: 2, paymentMethod: 'UPI', location: 'Indiranagar' },

    { date: '2025-12-31', merchant: 'The Tao Terraces', amount: 8900, category: 'Entertainment', item: 'New Year Eve Celebration Pass', quantity: 2, paymentMethod: 'Credit Card', location: 'MG Road' },
    { date: '2025-12-25', merchant: 'Amazon', amount: 7200, category: 'Shopping', item: 'Christmas Presents for Family & Friends', quantity: 4, paymentMethod: 'Credit Card', location: 'Online' },
    { date: '2025-12-22', merchant: 'MakeMyTrip', amount: 16400, category: 'Travel', item: 'Boutique Resort Stay in Goa', quantity: 1, paymentMethod: 'Credit Card', location: 'Goa' },
    { date: '2025-12-18', merchant: 'Swiggy', amount: 950, category: 'Food', item: 'Artisan Sourdough Pizza', quantity: 1, paymentMethod: 'UPI', location: 'Bengaluru' },
    { date: '2025-12-15', merchant: 'IKEA', amount: 6400, category: 'Essentials', item: 'LACK Coffee Table & Desk Lamp', quantity: 3, paymentMethod: 'Debit Card', location: 'Nagasandra' },
    { date: '2025-12-10', merchant: 'Starbucks Coffee', amount: 480, category: 'Food', item: 'Toffee Nut Crunch Latte', quantity: 1, paymentMethod: 'UPI', location: 'Bengaluru' },
    { date: '2025-12-05', merchant: 'Uber', amount: 540, category: 'Transport', item: 'Airport to City Center', quantity: 1, paymentMethod: 'UPI', location: 'Bengaluru' },

    { date: '2025-11-28', merchant: 'Amazon', amount: 14200, category: 'Tech', item: 'Sony WH-1000XM4 Noise Canceling Headphones', quantity: 1, paymentMethod: 'Credit Card', location: 'Online' },
    { date: '2025-11-24', merchant: 'Zomato', amount: 780, category: 'Food', item: 'Sichuan Noodles & Dim Sums', quantity: 2, paymentMethod: 'UPI', location: 'Koramangala' },
    { date: '2025-11-19', merchant: 'Blue Tokai Coffee', amount: 360, category: 'Food', item: 'Pour Over Special Roast', quantity: 1, paymentMethod: 'UPI', location: 'Indiranagar' },
    { date: '2025-11-15', merchant: 'Decathlon', amount: 3200, category: 'Fitness', item: 'Running Shoes & Dri-Fit Tees', quantity: 3, paymentMethod: 'UPI', location: 'Anubhava Mall' },
    { date: '2025-11-10', merchant: 'Blinkit', amount: 890, category: 'Essentials', item: 'Organic honey, oats & green tea', quantity: 3, paymentMethod: 'UPI', location: 'Bengaluru' },
    { date: '2025-11-04', merchant: 'Uber', amount: 320, category: 'Transport', item: 'Evening commute back from coworking', quantity: 1, paymentMethod: 'UPI', location: 'Bengaluru' },

    { date: '2025-10-29', merchant: 'Swiggy', amount: 1100, category: 'Food', item: 'Weekend Mexican feast', quantity: 2, paymentMethod: 'UPI', location: 'Bengaluru' },
    { date: '2025-10-24', merchant: 'Zara', amount: 6990, category: 'Shopping', item: 'Tailored Blazer & Smart Trousers', quantity: 2, paymentMethod: 'Credit Card', location: 'Bengaluru' },
    { date: '2025-10-20', merchant: 'Starbucks Coffee', amount: 430, category: 'Food', item: 'Java Chip Frappuccino', quantity: 1, paymentMethod: 'UPI', location: 'Indiranagar' },
    { date: '2025-10-15', merchant: 'Reliance Fresh', amount: 2850, category: 'Essentials', item: 'Grocery restock & cleaning essentials', quantity: 7, paymentMethod: 'Debit Card', location: 'Bengaluru' },
    { date: '2025-10-08', merchant: 'Apple Store', amount: 1900, category: 'Tech', item: 'Braided USB-C 240W Cable', quantity: 1, paymentMethod: 'Credit Card', location: 'Online' },
    { date: '2025-10-02', merchant: 'Uber', amount: 260, category: 'Transport', item: 'Morning metro connection ride', quantity: 1, paymentMethod: 'UPI', location: 'Bengaluru' },

    { date: '2025-09-27', merchant: 'Zomato', amount: 840, category: 'Food', item: 'Artisan Burgers & Curly Fries', quantity: 2, paymentMethod: 'UPI', location: 'Indiranagar' },
    { date: '2025-09-22', merchant: 'BookMyShow', amount: 900, category: 'Entertainment', item: 'Stand-up Comedy Live Tour', quantity: 2, paymentMethod: 'UPI', location: 'The Humming Tree' },
    { date: '2025-09-18', merchant: 'Amazon', amount: 2450, category: 'Shopping', item: 'Stainless Steel Insulated Flask & Bottle', quantity: 1, paymentMethod: 'Credit Card', location: 'Online' },
    { date: '2025-09-12', merchant: 'Swiggy', amount: 560, category: 'Food', item: 'Dosa & Filter Coffee breakfast', quantity: 2, paymentMethod: 'UPI', location: 'Bengaluru' },
    { date: '2025-09-05', merchant: 'Uber', amount: 420, category: 'Transport', item: 'Late night airport pickup', quantity: 1, paymentMethod: 'UPI', location: 'Bengaluru' },
  ];

  /* --------------------------------------------------------------------------
   * 3. INITIALIZATION
   * -------------------------------------------------------------------------- */
  function init() {
    setupTheme();
    setupEventListeners();
    setupCanvasObservers();
    setupVoiceSearch();
    setupStoryCardScrollObserver();
    loadDemoDataset();
  }

  /* --------------------------------------------------------------------------
   * 4. THEME CONTROLLER (Dark / Light Mode)
   * -------------------------------------------------------------------------- */
  function setupTheme() {
    const savedTheme = localStorage.getItem('receipts_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('receipts_theme', nextTheme);
        updateThemeIcon(nextTheme);
        renderCharts(); // Re-render canvas charts with theme-adjusted colors
      });
    }
  }

  function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  /* --------------------------------------------------------------------------
   * 5. DATASET LOADING & NORMALIZATION
   * -------------------------------------------------------------------------- */
  function loadDemoDataset() {
    state.isDemo = true;
    state.isSpotify = false;
    state.activeDatasetId = 'demo';
    state.datasets = [
      {
        id: 'demo',
        name: 'Demo Financial Data',
        type: 'expense',
        fileName: 'demo_data.json',
        transactions: JSON.parse(JSON.stringify(DEMO_TRANSACTIONS)),
        isDemo: true,
      }
    ];
    state.rawTransactions = state.datasets[0].transactions;
    normalizeData(state.rawTransactions);
    renderDatasetSwitcher();
    updateDatasetStatusBanner();
    populateFilterDropdowns();
    applyFilters();
    showToast('✨ Demo Data Loaded! Upload your own CSV/JSON anytime.');
  }

  /**
   * Calculates the distance between two geographic coordinates using the Haversine formula
   * @param {number} lat1 Latitude of point 1 (degrees)
   * @param {number} lon1 Longitude of point 1 (degrees)
   * @param {number} lat2 Latitude of point 2 (degrees)
   * @param {number} lon2 Longitude of point 2 (degrees)
   * @returns {number} Great-circle distance in kilometers
   */
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's mean radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Safely sanitize and normalize an array of transaction objects
   */
  function normalizeData(records) {
    const valid = [];

    records.forEach((row, idx) => {
      // 1. Amount normalizer
      let amt = row.amount;
      if (typeof amt === 'string') {
        amt = parseFloat(amt.replace(/[^0-9.-]+/g, ''));
      }
      if (isNaN(amt) || amt == null) amt = 0;
      amt = Math.abs(amt);

      // If Spotify milliseconds played is detected, convert to minutes
      if (state.isSpotify && amt > 1000) {
        amt = Math.round((amt / 60000) * 10) / 10;
      }

      // 2. Date normalizer
      let parsedDate = parseDateString(row.date);
      if (!parsedDate) {
        parsedDate = new Date().toISOString().split('T')[0]; // fallback
      }

      // 3. Merchant normalizer
      let merchant = (row.merchant || row.store || row.vendor || (state.isSpotify ? 'Unknown Artist' : 'Unknown Merchant')).trim();
      merchant = merchant.replace(/^["']|["']$/g, '');

      // 4. Category & Smart Categorizer
      let category = (row.category || '').trim();
      if (!category) {
        category = state.isSpotify ? 'Single / Album' : guessCategory(merchant, row.item);
      } else {
        category = state.isSpotify ? category : cleanCategoryName(category);
      }

      // 5. Item / Description
      const item = (row.item || row.description || row.items || merchant).trim();

      // 6. Payment & Location
      const paymentMethod = (row.payment_method || row.paymentMethod || row.payment || (state.isSpotify ? 'Spotify Player' : 'Card/UPI')).trim();
      const location = (row.location || row.city || (state.isSpotify ? 'Online Stream' : 'Local')).trim();
      const quantity = parseInt(row.quantity || row.qty || 1, 10) || 1;

      // 7. Income / Expense column check
      const incomeTypeCheck = String(
        row['Income/Expense'] ||
        row['income/expense'] ||
        row.income_expense ||
        row.type ||
        row.transaction_type ||
        row.flow ||
        ''
      ).trim().toLowerCase();
      const isIncome = incomeTypeCheck === 'income';

      // 8. Geographic Fraud & Anomaly Detection (lat, long, merch_lat, merch_long)
      const latVal = row.lat != null ? row.lat : (row.latitude != null ? row.latitude : null);
      const lonVal = row.long != null ? row.long : (row.lon != null ? row.lon : (row.lng != null ? row.lng : (row.longitude != null ? row.longitude : null)));
      const merchLatVal = row.merch_lat != null ? row.merch_lat : (row.merchant_lat != null ? row.merchant_lat : (row.merch_latitude != null ? row.merch_latitude : null));
      const merchLonVal = row.merch_long != null ? row.merch_long : (row.merch_lon != null ? row.merch_lon : (row.merch_lng != null ? row.merch_lng : (row.merchant_longitude != null ? row.merchant_longitude : null)));

      let anomalyFlag = null;
      let distanceKm = null;
      let userLat = null;
      let userLon = null;
      let mLat = null;
      let mLon = null;

      if (latVal != null && lonVal != null && merchLatVal != null && merchLonVal != null) {
        userLat = parseFloat(latVal);
        userLon = parseFloat(lonVal);
        mLat = parseFloat(merchLatVal);
        mLon = parseFloat(merchLonVal);

        if (!isNaN(userLat) && !isNaN(userLon) && !isNaN(mLat) && !isNaN(mLon)) {
          distanceKm = calculateDistance(userLat, userLon, mLat, mLon);
          if (distanceKm > 500) {
            anomalyFlag = "⚠️ High-Risk: Distant Merchant";
          }
        }
      }

      valid.push({
        id: `TX-${idx + 1}-${Math.floor(Math.random() * 8999 + 1000)}`,
        date: parsedDate,
        merchant,
        category,
        item,
        quantity,
        amount: amt,
        paymentMethod,
        location,
        isIncome: isIncome,
        anomalyFlag: anomalyFlag,
        distanceKm: distanceKm,
        lat: userLat,
        long: userLon,
        merch_lat: mLat,
        merch_long: mLon,
      });
    });

    state.transactions = valid;
    populateYearSelectOptions();
  }

  /**
   * Parse various date string formats (YYYY-MM-DD, DD/MM/YYYY, MM-DD-YYYY, etc.)
   */
  function parseDateString(raw) {
    if (!raw) return null;
    if (raw instanceof Date && !isNaN(raw)) {
      return raw.toISOString().split('T')[0];
    }
    const str = String(raw).trim();

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    // ISO timestamp like 2026-03-15T14:23:10Z or 2026-03-15 14:23:10
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(str)) {
      return str.split(/[ T]/)[0];
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }

    // Try standard Date.parse
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return null;
  }

  /**
   * Heuristic category classifier if category is missing in dataset
   */
  function guessCategory(merchant = '', item = '') {
    const text = (merchant + ' ' + item).toLowerCase();
    if (/swiggy|zomato|starbucks|coffee|food|restaurant|mcdonald|burger|pizza|tokai|cafe|diner|bistro|bakery/i.test(text)) return 'Food';
    if (/uber|ola|cab|fuel|petrol|metro|flight|airline|indigo|train|transit|taxi|toll/i.test(text)) return 'Transport';
    if (/amazon|zara|h&m|shopping|retail|cloth|myntra|flipkart|uniqlo|apparel/i.test(text)) return 'Shopping';
    if (/blinkit|zepto|grocery|reliance|supermarket|vegetable|milk|mart|dmart|ikea/i.test(text)) return 'Essentials';
    if (/netflix|spotify|cinema|pvr|movie|ticket|bookmyshow|game|steam|prime/i.test(text)) return 'Entertainment';
    if (/apple|laptop|electronics|croma|gadget|mobile|headphone|kindle/i.test(text)) return 'Tech';
    if (/gym|cult|fitness|protein|decathlon|yoga|marathon/i.test(text)) return 'Fitness';
    if (/makemytrip|hotel|resort|airbnb|travel|tour|flight/i.test(text)) return 'Travel';
    return 'Other';
  }

  function cleanCategoryName(cat) {
    const c = cat.toLowerCase();
    if (c.includes('food') || c.includes('dining') || c.includes('restaur')) return 'Food';
    if (c.includes('shop') || c.includes('cloth') || c.includes('wear')) return 'Shopping';
    if (c.includes('transport') || c.includes('transit') || c.includes('ride')) return 'Transport';
    if (c.includes('travel') || c.includes('flight') || c.includes('hotel')) return 'Travel';
    if (c.includes('entertain') || c.includes('stream') || c.includes('fun')) return 'Entertainment';
    if (c.includes('essential') || c.includes('grocer') || c.includes('pantry')) return 'Essentials';
    if (c.includes('tech') || c.includes('gadget') || c.includes('electronic')) return 'Tech';
    if (c.includes('fit') || c.includes('gym') || c.includes('health')) return 'Fitness';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  /* --------------------------------------------------------------------------
   * 6. MULTI-FILE UPLOAD, PARSER & DATASET MANAGEMENT
   * -------------------------------------------------------------------------- */
  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file ' + file.name));
      reader.readAsText(file);
    });
  }

  function parseJSONContent(text) {
    const data = JSON.parse(text);
    const rows = Array.isArray(data) ? data : (data.transactions || data.receipts || data.items || []);
    if (!rows.length) throw new Error('No records found in JSON structure.');
    return { rows, headers: Object.keys(rows[0]) };
  }

  function parseCSVContent(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) throw new Error('CSV must contain a header row and at least one data row.');
    const headers = parseCSVLine(lines[0]).map(h => h.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = parseCSVLine(lines[i]);
      if (cells.length >= 2) {
        const obj = {};
        headers.forEach((h, colIdx) => {
          obj[h] = cells[colIdx] !== undefined ? cells[colIdx].trim() : '';
        });
        rows.push(obj);
      }
    }
    return { rows, headers };
  }

  async function handleUploadedFiles(fileList) {
    if (!fileList || !fileList.length) return;

    const files = Array.from(fileList);
    const progressWrap = document.getElementById('uploadProgressWrap');
    const progressText = document.getElementById('uploadProgressText');
    const dropzone = document.getElementById('fileDropzone');
    const uploadOptions = document.getElementById('uploadModeOptions');

    if (progressWrap) progressWrap.style.display = 'block';
    if (dropzone) dropzone.style.display = 'none';
    if (uploadOptions) uploadOptions.style.display = 'none';

    const selectedMode = document.querySelector('input[name="uploadModeRadio"]:checked')?.value || 'merge';
    const parsedDatasets = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (progressText) {
        progressText.textContent = `Reading and analyzing ${i + 1} of ${files.length}: ${file.name}...`;
      }

      try {
        const text = await readFileAsText(file);
        const fileName = file.name.toLowerCase();
        let rows = [];
        let headers = [];

        if (fileName.endsWith('.json')) {
          const res = parseJSONContent(text);
          rows = res.rows;
          headers = res.headers;
        } else {
          const res = parseCSVContent(text);
          rows = res.rows;
          headers = res.headers;
        }

        const mapping = guessColumnMapping(headers);
        const isSpotify = headers.some(h => {
          const lh = h.toLowerCase();
          return lh.includes('spotify') || lh === 'ms_played' || lh === 'track_name' || lh === 'artist_name';
        });

        // Normalize rows for this dataset
        const normRows = rows.map((r, rIdx) => {
          let amt = r[mapping.amount];
          if (typeof amt === 'string') amt = parseFloat(amt.replace(/[^0-9.-]+/g, ''));
          if (isNaN(amt) || amt == null) amt = 0;
          amt = Math.abs(amt);
          if (isSpotify && amt > 1000) {
            amt = Math.round((amt / 60000) * 10) / 10;
          }

          let pDate = parseDateString(r[mapping.date]) || new Date().toISOString().split('T')[0];
          let merch = (r[mapping.merchant] || (isSpotify ? 'Unknown Artist' : 'Unknown Merchant')).trim().replace(/^["']|["']$/g, '');
          let cat = (mapping.category ? r[mapping.category] : '').trim();
          if (!cat) cat = isSpotify ? 'Single / Album' : guessCategory(merch, r[mapping.item]);
          else cat = isSpotify ? cat : cleanCategoryName(cat);
          let item = (r[mapping.item] || merch).trim();
          let pay = (mapping.paymentMethod ? r[mapping.paymentMethod] : (isSpotify ? 'Spotify Player' : 'Card/UPI')).trim();
          let loc = (mapping.location ? r[mapping.location] : (isSpotify ? 'Online Stream' : 'Local')).trim();

          // Income / Expense check
          const incomeTypeCheck = String(
            r['Income/Expense'] ||
            r['income/expense'] ||
            r.income_expense ||
            r.type ||
            r.transaction_type ||
            r.flow ||
            ''
          ).trim().toLowerCase();
          const isIncome = incomeTypeCheck === 'income';

          // Lat/long coordinates & anomaly check
          const latVal = r.lat != null ? r.lat : (r.latitude != null ? r.latitude : null);
          const lonVal = r.long != null ? r.long : (r.lon != null ? r.lon : (r.lng != null ? r.lng : (r.longitude != null ? r.longitude : null)));
          const merchLatVal = r.merch_lat != null ? r.merch_lat : (r.merchant_lat != null ? r.merchant_lat : (r.merch_latitude != null ? r.merch_latitude : null));
          const merchLonVal = r.merch_long != null ? r.merch_long : (r.merch_lon != null ? r.merch_lon : (r.merch_lng != null ? r.merch_lng : (r.merchant_longitude != null ? r.merchant_longitude : null)));

          let anomalyFlag = null;
          let distanceKm = null;
          let userLat = null;
          let userLon = null;
          let mLat = null;
          let mLon = null;

          if (latVal != null && lonVal != null && merchLatVal != null && merchLonVal != null) {
            userLat = parseFloat(latVal);
            userLon = parseFloat(lonVal);
            mLat = parseFloat(merchLatVal);
            mLon = parseFloat(merchLonVal);

            if (!isNaN(userLat) && !isNaN(userLon) && !isNaN(mLat) && !isNaN(mLon)) {
              distanceKm = calculateDistance(userLat, userLon, mLat, mLon);
              if (distanceKm > 500) {
                anomalyFlag = "⚠️ High-Risk: Distant Merchant";
              }
            }
          }

          return {
            id: `TX-${rIdx + 1}-${Math.floor(Math.random() * 8999 + 1000)}`,
            date: pDate,
            merchant: merch,
            category: cat,
            item: item,
            amount: amt,
            quantity: parseInt(r[mapping.quantity] || 1, 10) || 1,
            paymentMethod: pay,
            location: loc,
            isIncome: isIncome,
            anomalyFlag: anomalyFlag,
            distanceKm: distanceKm,
            lat: userLat,
            long: userLon,
            merch_lat: mLat,
            merch_long: mLon,
            sourceFile: file.name,
          };
        });

        parsedDatasets.push({
          id: `ds-${Date.now()}-${i}`,
          name: file.name,
          fileName: file.name,
          type: isSpotify ? 'spotify' : 'expense',
          transactions: normRows,
          isDemo: false,
        });

      } catch (err) {
        console.error('Error parsing file:', file.name, err);
        showToast(`⚠️ Could not parse ${file.name}: ${err.message}`);
      }
    }

    if (!parsedDatasets.length) {
      showToast('❌ No valid records found in uploaded file(s).');
      resetUploadModalUI();
      return;
    }

    // Integrate into state.datasets based on user upload mode
    if (selectedMode === 'replace' || state.isDemo) {
      state.datasets = parsedDatasets;
    } else {
      // 'merge' or 'separate'
      state.datasets = state.datasets.filter(d => !d.isDemo).concat(parsedDatasets);
    }

    state.isDemo = false;
    const nextActiveId = state.datasets.length > 1 ? 'all' : state.datasets[0].id;
    activateDataset(nextActiveId);
    closeUploadModal();

    const totalRecords = parsedDatasets.reduce((sum, d) => sum + d.transactions.length, 0);
    showToast(`🎉 Successfully loaded ${parsedDatasets.length} dataset(s) with ${totalRecords.toLocaleString()} items!`);
  }

  function activateDataset(id) {
    state.activeDatasetId = id;

    if (id === 'all') {
      const mergedMap = new Map();
      let hasSpotify = false;

      state.datasets.forEach(ds => {
        if (ds.type === 'spotify') hasSpotify = true;
        ds.transactions.forEach(t => {
          const key = `${t.date}|${t.merchant.toLowerCase()}|${t.item.toLowerCase()}|${t.amount}`;
          if (!mergedMap.has(key)) {
            mergedMap.set(key, t);
          }
        });
      });

      state.transactions = Array.from(mergedMap.values());
      state.isSpotify = hasSpotify;
    } else {
      const found = state.datasets.find(d => d.id === id);
      if (found) {
        state.transactions = [...found.transactions];
        state.isSpotify = found.type === 'spotify';
      }
    }

    populateYearSelectOptions();
    renderDatasetSwitcher();
    updateDatasetStatusBanner();
    populateFilterDropdowns();
    applyFilters();
  }

  function renderDatasetSwitcher() {
    const select = document.getElementById('datasetSelect');
    const badge = document.getElementById('datasetCountBadge');
    if (!select) return;

    let optionsHtml = '';
    const nonDemo = state.datasets.filter(d => !d.isDemo);

    if (nonDemo.length > 1) {
      const totalCombined = state.datasets.reduce((acc, d) => acc + d.transactions.length, 0);
      optionsHtml += `<option value="all" ${state.activeDatasetId === 'all' ? 'selected' : ''}>✨ Combined All (${nonDemo.length} Files • ${totalCombined.toLocaleString()} rows)</option>`;
    }

    state.datasets.forEach(ds => {
      const icon = ds.type === 'spotify' ? '🎵' : '🧾';
      optionsHtml += `<option value="${ds.id}" ${state.activeDatasetId === ds.id ? 'selected' : ''}>${icon} ${escapeHTML(ds.name)} (${ds.transactions.length.toLocaleString()})</option>`;
    });

    select.innerHTML = optionsHtml;

    if (badge) {
      const count = nonDemo.length || 1;
      badge.textContent = `${count} Dataset${count === 1 ? '' : 's'}`;
    }
  }

  function renderDatasetsManagerModal() {
    const list = document.getElementById('datasetsList');
    const summaryText = document.getElementById('datasetsSummaryText');
    if (!list) return;

    const totalTxs = state.datasets.reduce((acc, d) => acc + d.transactions.length, 0);
    if (summaryText) {
      summaryText.textContent = `${state.datasets.length} Dataset${state.datasets.length === 1 ? '' : 's'} Loaded (${totalTxs.toLocaleString()} total rows)`;
    }

    let itemsHtml = '';
    if (state.datasets.length > 1) {
      const isAllActive = state.activeDatasetId === 'all';
      itemsHtml += `
        <div class="dataset-item-row ${isAllActive ? 'active' : ''}">
          <div class="dataset-item-info">
            <span class="dataset-item-name">✨ Combined (All Datasets Merged)</span>
            <span class="dataset-item-meta">${totalTxs.toLocaleString()} combined records across ${state.datasets.length} files • Auto-deduplicated</span>
          </div>
          <div class="dataset-item-actions">
            <button class="btn btn-primary btn-sm activate-ds-btn" data-id="all">
              ${isAllActive ? '✓ Active View' : 'Switch To Combined'}
            </button>
          </div>
        </div>
      `;
    }

    itemsHtml += state.datasets.map(ds => {
      const icon = ds.type === 'spotify' ? '🎵' : '🧾';
      const isActive = state.activeDatasetId === ds.id;
      return `
        <div class="dataset-item-row ${isActive ? 'active' : ''}">
          <div class="dataset-item-info">
            <span class="dataset-item-name">${icon} ${escapeHTML(ds.name)}</span>
            <span class="dataset-item-meta">${ds.transactions.length.toLocaleString()} records • ${ds.type === 'spotify' ? 'Spotify Audio History' : 'Purchase Receipts'}</span>
          </div>
          <div class="dataset-item-actions">
            <button class="btn btn-outline btn-sm activate-ds-btn" data-id="${ds.id}">
              ${isActive ? '✓ Active' : 'Switch To'}
            </button>
            ${!ds.isDemo ? `<button class="btn btn-outline btn-sm delete-ds-btn" data-id="${ds.id}" title="Remove dataset">🗑️</button>` : ''}
          </div>
        </div>
      `;
    }).join('');

    list.innerHTML = itemsHtml;

    list.querySelectorAll('.activate-ds-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        activateDataset(id);
        renderDatasetsManagerModal();
        showToast('Switched active dataset');
      });
    });

    list.querySelectorAll('.delete-ds-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        state.datasets = state.datasets.filter(d => d.id !== id);
        if (!state.datasets.length) {
          loadDemoDataset();
        } else {
          activateDataset(state.datasets[0].id);
        }
        renderDatasetsManagerModal();
        showToast('Dataset removed');
      });
    });
  }

  function parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        if (inQuotes && line[i + 1] === char) {
          cur += char;
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur);
    return result;
  }

  function evaluateColumnMapping(headers, rows) {
    const mapping = guessColumnMapping(headers);
    if (mapping.date && mapping.amount && mapping.merchant) {
      applyColumnMappingAndFinish(mapping, rows);
    } else {
      renderColumnMappingUI(headers, mapping);
    }
  }

  function guessColumnMapping(headers) {
    const mapping = {
      date: '',
      merchant: '',
      amount: '',
      category: '',
      item: '',
      quantity: '',
      paymentMethod: '',
      location: '',
    };

    const lower = headers.map(h => h.toLowerCase());

    // Auto-detect Spotify Extended Streaming History schema
    const isSpotify = lower.some(h => h.includes('spotify') || h === 'ms_played' || h === 'track_name' || h === 'artist_name');
    state.isSpotify = isSpotify;

    const findKey = (patterns) => {
      for (const pat of patterns) {
        const idx = lower.findIndex(h => h === pat || h.includes(pat));
        if (idx !== -1) return headers[idx];
      }
      return '';
    };

    if (isSpotify) {
      mapping.date = findKey(['ts', 'timestamp', 'date', 'time']);
      mapping.merchant = findKey(['artist_name', 'artist', 'merchant', 'store', 'vendor']);
      mapping.item = findKey(['track_name', 'track', 'song', 'title', 'item']);
      mapping.category = findKey(['album_name', 'album', 'category', 'genre']);
      mapping.amount = findKey(['ms_played', 'played_ms', 'duration_ms', 'duration', 'amount']);
      mapping.paymentMethod = findKey(['platform', 'device', 'payment_method', 'payment']);
      mapping.location = findKey(['platform', 'location', 'city', 'place']);
      mapping.quantity = findKey(['quantity', 'qty', 'count']);
    } else {
      mapping.date = findKey(['date', 'time', 'timestamp', 'transaction_date', 'tx_date']);
      mapping.merchant = findKey(['merchant', 'store', 'vendor', 'shop', 'payee', 'retailer']);
      mapping.amount = findKey(['amount', 'total', 'cost', 'price', 'inr', 'spend', 'val']);
      mapping.category = findKey(['category', 'type', 'genre', 'dept']);
      mapping.item = findKey(['item', 'description', 'product', 'items', 'note']);
      mapping.quantity = findKey(['quantity', 'qty', 'count']);
      mapping.paymentMethod = findKey(['payment_method', 'payment', 'method', 'mode']);
      mapping.location = findKey(['location', 'city', 'place', 'address']);
    }

    return mapping;
  }

  function renderColumnMappingUI(headers, currentMapping) {
    const progressWrap = document.getElementById('uploadProgressWrap');
    const mappingContainer = document.getElementById('columnMappingContainer');
    const mappingGrid = document.getElementById('mappingGrid');

    if (progressWrap) progressWrap.style.display = 'none';
    if (mappingContainer) mappingContainer.style.display = 'block';

    if (!mappingGrid) return;

    const fields = [
      { key: 'date', label: 'Date', required: true },
      { key: 'merchant', label: 'Merchant / Store', required: true },
      { key: 'amount', label: 'Amount', required: true },
      { key: 'category', label: 'Category', required: false },
      { key: 'item', label: 'Item / Note', required: false },
      { key: 'quantity', label: 'Quantity', required: false },
      { key: 'paymentMethod', label: 'Payment Method', required: false },
      { key: 'location', label: 'Location', required: false },
    ];

    mappingGrid.innerHTML = fields.map(field => {
      const selectedCol = currentMapping[field.key] || '';
      const optionsHtml = ['<option value="">-- Ignore / Not in file --</option>']
        .concat(headers.map(h => `<option value="${escapeHTML(h)}" ${h === selectedCol ? 'selected' : ''}>${escapeHTML(h)}</option>`))
        .join('');

      return `
        <div class="mapping-field-item">
          <label class="mapping-field-label">
            ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
          </label>
          <select class="select-dropdown" id="mapField_${field.key}">
            ${optionsHtml}
          </select>
        </div>
      `;
    }).join('');
  }

  function applyColumnMappingAndFinish(mapping, rows) {
    const mapped = rows.map(r => ({
      date: r[mapping.date],
      merchant: r[mapping.merchant],
      amount: r[mapping.amount],
      category: mapping.category ? r[mapping.category] : '',
      item: mapping.item ? r[mapping.item] : '',
      quantity: mapping.quantity ? r[mapping.quantity] : 1,
      payment_method: mapping.paymentMethod ? r[mapping.paymentMethod] : '',
      location: mapping.location ? r[mapping.location] : '',
    }));

    state.isDemo = false;
    normalizeData(mapped);
    updateDatasetStatusBanner();
    populateFilterDropdowns();
    applyFilters();
    closeUploadModal();
    showToast(`🎉 Successfully loaded ${state.transactions.length} personal transactions!`);
  }

  /* --------------------------------------------------------------------------
   * 7. FILTER SYSTEM & SEARCH
   * -------------------------------------------------------------------------- */
  function applyFilters() {
    const { search, dateRange, startDate, endDate, category, merchant, paymentMethod } = state.filters;
    const now = new Date();

    const filtered = state.transactions.filter(tx => {
      // 1. Search Query
      if (search) {
        const query = search.toLowerCase();
        const matches =
          tx.merchant.toLowerCase().includes(query) ||
          tx.item.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query) ||
          tx.location.toLowerCase().includes(query) ||
          tx.paymentMethod.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // 2. Category Filter
      if (category !== 'all' && tx.category !== category) {
        return false;
      }

      // 3. Merchant Filter
      if (merchant !== 'all' && tx.merchant !== merchant) {
        return false;
      }

      // 4. Payment Method Filter
      if (paymentMethod !== 'all' && tx.paymentMethod !== paymentMethod) {
        return false;
      }

      // 5. Date Range Filter
      const txDate = new Date(tx.date);
      if (isNaN(txDate.getTime())) return true;

      if (dateRange === 'this-year') {
        if (txDate.getFullYear() !== now.getFullYear()) return false;
      } else if (dateRange === 'this-month') {
        if (txDate.getFullYear() !== now.getFullYear() || txDate.getMonth() !== now.getMonth()) return false;
      } else if (dateRange === 'last-30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (txDate < thirtyDaysAgo || txDate > now) return false;
      } else if (dateRange === 'custom') {
        if (startDate && tx.date < startDate) return false;
        if (endDate && tx.date > endDate) return false;
      }

      return true;
    });

    state.filteredTransactions = filtered;
    state.table.currentPage = 1; // reset pagination

    renderAllViews();
  }

  function resetFilters() {
    state.filters = {
      search: '',
      dateRange: 'all',
      startDate: null,
      endDate: null,
      category: 'all',
      merchant: 'all',
      paymentMethod: 'all',
    };

    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) searchInput.value = '';

    const dateSelect = document.getElementById('filterDateRange');
    if (dateSelect) dateSelect.value = 'all';

    const customDateWrap = document.getElementById('customDateRangeInputs');
    if (customDateWrap) customDateWrap.style.display = 'none';

    const catSelect = document.getElementById('filterCategory');
    if (catSelect) catSelect.value = 'all';

    const merchSelect = document.getElementById('filterMerchant');
    if (merchSelect) merchSelect.value = 'all';

    const paySelect = document.getElementById('filterPayment');
    if (paySelect) paySelect.value = 'all';

    applyFilters();
    showToast('Filters reset to All Time');
  }

  function populateFilterDropdowns() {
    const categories = new Set();
    const merchants = new Set();
    const payments = new Set();

    state.transactions.forEach(t => {
      if (t.category) categories.add(t.category);
      if (t.merchant) merchants.add(t.merchant);
      if (t.paymentMethod) payments.add(t.paymentMethod);
    });

    populateSelect('filterCategory', Array.from(categories).sort(), 'All Categories');
    populateSelect('filterMerchant', Array.from(merchants).sort(), 'All Merchants');
    populateSelect('filterPayment', Array.from(payments).sort(), 'All Methods');
  }

  function populateSelect(elemId, items, defaultLabel) {
    const select = document.getElementById(elemId);
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = `<option value="all">${defaultLabel}</option>` +
      items.map(i => `<option value="${escapeHTML(i)}" ${i === currentVal ? 'selected' : ''}>${escapeHTML(i)}</option>`).join('');
  }

  function populateYearSelectOptions() {
    const yearSelect = document.getElementById('wrappedYearSelect');
    if (!yearSelect) return;

    const years = new Set();
    state.transactions.forEach(t => {
      const y = t.date.split('-')[0];
      if (y) years.add(y);
    });

    const sortedYears = Array.from(years).sort().reverse();
    yearSelect.innerHTML = '<option value="all">All Time Combined</option>' +
      sortedYears.map(y => `<option value="${y}">Year ${y}</option>`).join('');

    // Default to most recent year if available
    if (sortedYears.length > 0) {
      state.wrappedYear = sortedYears[0];
      yearSelect.value = sortedYears[0];
    }
  }

  /* --------------------------------------------------------------------------
   * 8. RENDER COORDINATOR
   * -------------------------------------------------------------------------- */
  function renderAllViews() {
    renderKPIs();
    renderWrappedRecap();
    renderCharts();
    renderCategoryLegend();
    renderMerchantAnalysis();
    renderInsights();
    renderTimeline();
    renderTransactionsTable();
  }

  function updateDatasetStatusBanner() {
    const badge = document.getElementById('statusSourceBadge');
    const title = document.getElementById('statusTitle');
    const dateRangeLbl = document.getElementById('statusDateRange');
    const countEl = document.getElementById('statusCount');
    const spendEl = document.getElementById('statusSpend');
    const merchEl = document.getElementById('statusMerchants');
    const catEl = document.getElementById('statusCategories');

    if (badge) {
      badge.textContent = state.isDemo ? 'Demo Data' : (state.isSpotify ? 'Spotify Dataset' : 'Custom Dataset');
      badge.style.background = state.isDemo ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)';
      badge.style.color = state.isDemo ? 'var(--primary)' : 'var(--accent-emerald)';
      badge.style.borderColor = state.isDemo ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.3)';
    }

    if (title) {
      title.textContent = state.isDemo ? 'Demo Dataset Loaded' : (state.isSpotify ? 'Spotify Streaming History Loaded' : 'Your Dataset Loaded Successfully');
    }

    const txs = state.transactions;
    if (countEl) countEl.textContent = txs.length.toLocaleString();

    let total = 0;
    const merchants = new Set();
    const categories = new Set();
    let minDate = '';
    let maxDate = '';

    txs.forEach(t => {
      total += t.amount;
      if (t.merchant) merchants.add(t.merchant);
      if (t.category) categories.add(t.category);
      if (!minDate || t.date < minDate) minDate = t.date;
      if (!maxDate || t.date > maxDate) maxDate = t.date;
    });

    if (spendEl) spendEl.textContent = formatCurrency(total);
    if (merchEl) merchEl.textContent = merchants.size;
    if (catEl) catEl.textContent = categories.size;

    const spendLbl = document.querySelector('#statusSpend + .metric-lbl');
    if (spendLbl) spendLbl.textContent = state.isSpotify ? 'Total Listened' : 'Total Spend';
    const merchLbl = document.querySelector('#statusMerchants + .metric-lbl');
    if (merchLbl) merchLbl.textContent = state.isSpotify ? 'Artists' : 'Merchants';
    const catLbl = document.querySelector('#statusCategories + .metric-lbl');
    if (catLbl) catLbl.textContent = state.isSpotify ? 'Albums' : 'Categories';
    const txLbl = document.querySelector('#statusCount + .metric-lbl');
    if (txLbl) txLbl.textContent = state.isSpotify ? 'Streams' : 'Receipts';

    if (dateRangeLbl && minDate && maxDate) {
      dateRangeLbl.textContent = `${formatDateFriendly(minDate)} to ${formatDateFriendly(maxDate)}`;
    }

    const heroPrice = document.getElementById('heroReceiptPrice');
    if (heroPrice) heroPrice.textContent = formatCurrency(total);
  }

  /* --------------------------------------------------------------------------
   * 9. MAIN DASHBOARD: KPI CARDS
   * -------------------------------------------------------------------------- */
  function renderKPIs() {
    const data = state.filteredTransactions;

    // Independently track and calculate totalIncome and totalExpense
    let totalIncome = 0;
    let totalExpense = 0;
    let hasIncome = false;

    data.forEach(t => {
      if (t.isIncome) {
        totalIncome += t.amount;
        hasIncome = true;
      } else {
        totalExpense += t.amount;
      }
    });

    const netFlow = totalIncome - totalExpense;
    const totalSpend = hasIncome ? totalExpense : data.reduce((sum, t) => sum + t.amount, 0);
    const count = data.length;
    const expenseCount = data.filter(t => !t.isIncome).length;
    const avg = expenseCount > 0 ? totalExpense / expenseCount : (count > 0 ? (totalSpend || totalIncome) / count : 0);

    // Merchant frequency
    const merchantCounts = {};
    data.forEach(t => {
      merchantCounts[t.merchant] = (merchantCounts[t.merchant] || 0) + 1;
    });
    let topMerchant = 'None';
    let topMerchantVisits = 0;
    Object.entries(merchantCounts).forEach(([m, v]) => {
      if (v > topMerchantVisits) {
        topMerchantVisits = v;
        topMerchant = m;
      }
    });

    // Top Category by spend
    const categorySpends = {};
    data.forEach(t => {
      categorySpends[t.category] = (categorySpends[t.category] || 0) + t.amount;
    });
    let topCat = 'None';
    let topCatSpend = 0;
    Object.entries(categorySpends).forEach(([c, s]) => {
      if (s > topCatSpend) {
        topCatSpend = s;
        topCat = c;
      }
    });

    // Highest Spending Single Day (only consider expenses)
    const daySpends = {};
    data.forEach(t => {
      if (!t.isIncome) {
        daySpends[t.date] = (daySpends[t.date] || 0) + t.amount;
      }
    });
    let peakDay = 'None';
    let peakDaySpend = 0;
    Object.entries(daySpends).forEach(([d, s]) => {
      if (s > peakDaySpend) {
        peakDaySpend = s;
        peakDay = d;
      }
    });

    // Adapt KPI labels for Spotify vs Expense vs Net Flow
    const kpi1Label = document.querySelector('.kpi-card:nth-child(1) .kpi-label');
    const kpi1Icon = document.querySelector('.kpi-card:nth-child(1) .kpi-icon-badge');
    const kpi1Sub = document.getElementById('kpiTotalSpendSub');
    const kpi1Val = document.getElementById('kpiTotalSpend');
    const kpi2Label = document.querySelector('.kpi-card:nth-child(2) .kpi-label');
    const kpi2Sub = document.getElementById('kpiTransactionsSub');
    const kpi3Label = document.querySelector('.kpi-card:nth-child(3) .kpi-label');
    const kpi3Sub = document.getElementById('kpiAvgReceiptSub');
    const kpi4Label = document.querySelector('.kpi-card:nth-child(4) .kpi-label');
    const kpi5Label = document.querySelector('.kpi-card:nth-child(5) .kpi-label');
    const kpi6Label = document.querySelector('.kpi-card:nth-child(6) .kpi-label');

    if (state.isSpotify) {
      if (kpi1Label) kpi1Label.textContent = 'Total Listening';
      if (kpi1Icon) { kpi1Icon.textContent = '🎧'; kpi1Icon.style.color = '#818cf8'; kpi1Icon.style.background = 'rgba(99, 102, 241, 0.15)'; }
      if (kpi1Sub) kpi1Sub.textContent = 'Active streaming duration';
      if (kpi2Label) kpi2Label.textContent = 'Tracks Streamed';
      if (kpi2Sub) kpi2Sub.textContent = 'Individual songs played';
      if (kpi3Label) kpi3Label.textContent = 'Avg Stream Time';
      if (kpi3Sub) kpi3Sub.textContent = 'Minutes listened per track';
      if (kpi4Label) kpi4Label.textContent = 'Top Streamed Artist';
      if (kpi5Label) kpi5Label.textContent = 'Top Streamed Album';
      if (kpi6Label) kpi6Label.textContent = 'Peak Listening Day';
      animateCurrency('kpiTotalSpend', totalSpend);
    } else if (hasIncome) {
      // Net Cash Flow Mode: Display Net Flow and split income vs. expense
      if (kpi1Label) kpi1Label.textContent = 'Net Flow';
      if (kpi1Icon) {
        kpi1Icon.textContent = netFlow >= 0 ? '📈' : '📉';
        kpi1Icon.style.color = netFlow >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)';
        kpi1Icon.style.background = netFlow >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';
      }
      if (kpi1Val) {
        const sign = netFlow >= 0 ? '+' : '';
        const color = netFlow >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)';
        kpi1Val.innerHTML = `<span style="color: ${color};">${sign}${formatCurrency(netFlow)}</span>`;
      }
      if (kpi1Sub) {
        kpi1Sub.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 700;">+${formatCurrency(totalIncome)} In</span> • <span style="color: var(--text-secondary);">${formatCurrency(totalExpense)} Out</span>`;
      }
      if (kpi2Label) kpi2Label.textContent = 'Transactions';
      if (kpi2Sub) kpi2Sub.textContent = 'Cash flow records tracked';
      if (kpi3Label) kpi3Label.textContent = 'Average Expense';
      if (kpi3Sub) kpi3Sub.textContent = 'Per outgoing checkout';
      if (kpi4Label) kpi4Label.textContent = 'Most Frequent Merchant';
      if (kpi5Label) kpi5Label.textContent = 'Top Category';
      if (kpi6Label) kpi6Label.textContent = 'Highest Spending Day';
    } else {
      if (kpi1Label) kpi1Label.textContent = 'Total Spending';
      if (kpi1Icon) { kpi1Icon.textContent = '₹'; kpi1Icon.style.color = '#818cf8'; kpi1Icon.style.background = 'rgba(99, 102, 241, 0.15)'; }
      if (kpi1Sub) kpi1Sub.textContent = 'Across all active filters';
      if (kpi2Label) kpi2Label.textContent = 'Transactions';
      if (kpi2Sub) kpi2Sub.textContent = 'Individual purchases recorded';
      if (kpi3Label) kpi3Label.textContent = 'Average Receipt';
      if (kpi3Sub) kpi3Sub.textContent = 'Per checkout transaction';
      if (kpi4Label) kpi4Label.textContent = 'Most Frequent Merchant';
      if (kpi5Label) kpi5Label.textContent = 'Top Category';
      if (kpi6Label) kpi6Label.textContent = 'Highest Spending Day';
      animateCurrency('kpiTotalSpend', totalSpend);
    }

    animateNumber('kpiTransactions', count);
    animateCurrency('kpiAvgReceipt', avg);

    const topMerchEl = document.getElementById('kpiTopMerchant');
    const topMerchSub = document.getElementById('kpiTopMerchantSub');
    if (topMerchEl) topMerchEl.textContent = topMerchant;
    if (topMerchSub) topMerchSub.textContent = `${topMerchantVisits} ${state.isSpotify ? 'stream' : 'visit'}${topMerchantVisits === 1 ? '' : 's'}`;

    const topCatEl = document.getElementById('kpiTopCategory');
    const topCatSub = document.getElementById('kpiTopCategorySub');
    if (topCatEl) topCatEl.textContent = (state.isSpotify ? '💿 ' : (CATEGORY_META[topCat]?.icon || '🏷️') + ' ') + topCat;
    if (topCatSub) topCatSub.textContent = `${formatCurrency(topCatSpend)} ${state.isSpotify ? 'streamed' : 'spent'}`;

    const peakDayEl = document.getElementById('kpiPeakDay');
    const peakDaySub = document.getElementById('kpiPeakDaySub');
    if (peakDayEl) peakDayEl.textContent = peakDay !== 'None' ? formatDateFriendly(peakDay) : 'None';
    if (peakDaySub) peakDaySub.textContent = `${formatCurrency(peakDaySpend)} ${state.isSpotify ? 'streamed' : 'spent'}`;
  }

  function animateCurrency(id, targetVal) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = 0;
    const duration = 600;
    const startTime = performance.now();

    function step(currTime) {
      const progress = Math.min((currTime - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currVal = Math.round(start + (targetVal - start) * ease);
      el.textContent = formatCurrency(currVal);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function animateNumber(id, targetVal) {
    const el = document.getElementById(id);
    if (!el) return;
    const startTime = performance.now();
    const duration = 500;

    function step(currTime) {
      const progress = Math.min((currTime - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currVal = Math.round(targetVal * ease);
      el.textContent = currVal.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* --------------------------------------------------------------------------
   * 10. "YOUR YEAR IN RECEIPTS" (ANNUAL SPOTIFY WRAPPED RECAP)
   * -------------------------------------------------------------------------- */
  function renderWrappedRecap() {
    const yearSelect = document.getElementById('wrappedYearSelect');
    const selectedYear = yearSelect ? yearSelect.value : 'all';

    let yearData = state.transactions;
    if (selectedYear !== 'all') {
      yearData = yearData.filter(t => t.date.startsWith(selectedYear));
    }

    const titleEl = document.getElementById('wrappedYearTitle');
    if (titleEl) {
      titleEl.textContent = selectedYear === 'all' ? 'Your All-Time Story in Receipts' : `Your ${selectedYear} In Receipts`;
    }

    const totalSpend = yearData.reduce((sum, t) => sum + t.amount, 0);
    const txCount = yearData.length;

    // Pillar counts
    let foodCount = 0;
    let shopCount = 0;
    let travelCount = 0;

    const monthSpends = {};
    const catSpends = {};
    const merchVisits = {};

    yearData.forEach(t => {
      const c = t.category.toLowerCase();
      if (c.includes('food')) foodCount++;
      else if (c.includes('shop')) shopCount++;
      else if (c.includes('travel') || c.includes('transit') || c.includes('transport')) travelCount++;

      // Month name
      const mStr = getMonthName(t.date);
      monthSpends[mStr] = (monthSpends[mStr] || 0) + t.amount;
      catSpends[t.category] = (catSpends[t.category] || 0) + t.amount;
      merchVisits[t.merchant] = (merchVisits[t.merchant] || 0) + 1;
    });

    // Top Month
    let topMonth = '--';
    let maxMonthSpend = 0;
    Object.entries(monthSpends).forEach(([m, s]) => {
      if (s > maxMonthSpend) {
        maxMonthSpend = s;
        topMonth = m;
      }
    });

    // Top Category
    let topCat = '--';
    let maxCatSpend = 0;
    Object.entries(catSpends).forEach(([c, s]) => {
      if (s > maxCatSpend) {
        maxCatSpend = s;
        topCat = c;
      }
    });

    // Most Visited Merchant
    let topMerch = '--';
    let maxMerchVisits = 0;
    Object.entries(merchVisits).forEach(([m, v]) => {
      if (v > maxMerchVisits) {
        maxMerchVisits = v;
        topMerch = m;
      }
    });

    // Set DOM elements
    const spendEl = document.getElementById('wrappedTotalSpend');
    if (spendEl) spendEl.textContent = formatCurrency(totalSpend);

    const txCountEl = document.getElementById('wrappedTxCount');
    if (txCountEl) txCountEl.textContent = txCount.toLocaleString();

    const foodEl = document.getElementById('wrappedFoodCount');
    if (foodEl) foodEl.textContent = `${foodCount} purchases`;

    const shopEl = document.getElementById('wrappedShopCount');
    if (shopEl) shopEl.textContent = `${shopCount} trips`;

    const travelEl = document.getElementById('wrappedTravelCount');
    if (travelEl) travelEl.textContent = `${travelCount} voyages`;

    const mEl = document.getElementById('wrappedTopMonth');
    if (mEl) mEl.textContent = topMonth;

    const cEl = document.getElementById('wrappedTopCategory');
    if (cEl) cEl.textContent = topCat;

    const merchEl = document.getElementById('wrappedTopMerchant');
    if (merchEl) merchEl.textContent = topMerch;

    // Narrative personality quote based on top category
    const quoteEl = document.getElementById('wrappedPersonalityQuote');
    if (quoteEl) {
      const quotes = {
        'Food': '"A dedicated culinary explorer who turns everyday cravings into memorable dining moments."',
        'Shopping': '"A curator of style, comfort, and essentials who appreciates life\'s finest design accents."',
        'Travel': '"A spontaneous globetrotter seeking new horizons and collecting stamps of experience."',
        'Tech': '"A forward-thinking innovator equipped with high-performance tools and smart hardware."',
        'Essentials': '"A pragmatic master of balanced living and sustainable everyday household wellness."',
        'Fitness': '"A relentless champion of personal fitness, disciplined strength, and active energy."',
      };
      quoteEl.textContent = quotes[topCat] || '"Your receipts paint the vivid portrait of a discerning, dynamic explorer."';
    }
  }

  /* --------------------------------------------------------------------------
   * 11. CHARTS ENGINE (VANILLA HTML5 CANVAS - RETINA SHARP)
   * -------------------------------------------------------------------------- */
  function setupCanvasObservers() {
    window.addEventListener('resize', () => {
      renderCharts();
    });

    // Interval toggle buttons (Daily, Weekly, Monthly)
    const toggles = document.querySelectorAll('.chart-interval-toggles .toggle-btn');
    toggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        toggles.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.chartInterval = e.currentTarget.getAttribute('data-interval');
        renderTimeSeriesChart();
      });
    });

    // Time series canvas mouse interactions
    const canvas = document.getElementById('timeSeriesCanvas');
    if (canvas) {
      canvas.addEventListener('mousemove', handleChartMouseMove);
      canvas.addEventListener('mouseleave', handleChartMouseLeave);
    }
  }

  function renderCharts() {
    renderTimeSeriesChart();
    renderDonutChart();
  }

  /**
   * High-DPI Canvas initialization helper
   */
  function setupHiDPICanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height, dpr };
  }

  /**
   * SPENDING OVER TIME CANVAS CHART
   */
  let cachedChartPoints = [];

  function renderTimeSeriesChart() {
    const canvas = document.getElementById('timeSeriesCanvas');
    if (!canvas) return;

    const { ctx, width, height } = setupHiDPICanvas(canvas);
    const data = state.filteredTransactions;

    if (!data.length) {
      drawEmptyCanvas(ctx, width, height, 'No transaction data available');
      cachedChartPoints = [];
      return;
    }

    // 1. Group data according to active interval
    const series = aggregateTimeSeries(data, state.chartInterval);
    if (!series.length) {
      drawEmptyCanvas(ctx, width, height, 'No points in selected interval');
      cachedChartPoints = [];
      return;
    }

    const padding = { top: 30, right: 30, bottom: 45, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxSpend = Math.max(...series.map(s => s.total), 100);
    // Nice Y-axis ceiling
    const niceCeil = calculateNiceCeiling(maxSpend);

    // Coordinate mapping
    const points = series.map((s, idx) => {
      const x = padding.left + (idx / (series.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - (s.total / niceCeil) * chartHeight;
      return { x, y, data: s };
    });
    cachedChartPoints = points;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw Y-Axis Grid Lines & Labels
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    ctx.font = '11px sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const val = (niceCeil / ySteps) * i;
      const y = padding.top + chartHeight - (val / niceCeil) * chartHeight;

      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillText(formatCompactCurrency(val), padding.left - 10, y);
    }

    // Draw X-Axis Labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xLabelStride = Math.ceil(series.length / 7);
    series.forEach((s, idx) => {
      if (idx % xLabelStride === 0 || idx === series.length - 1) {
        const pt = points[idx];
        ctx.fillText(s.label, pt.x, height - padding.bottom + 12);
      }
    });

    // Draw Smooth Spline Area Gradient
    if (points.length > 1) {
      const areaGrad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      areaGrad.addColorStop(0, 'rgba(99, 102, 241, 0.38)');
      areaGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.12)');
      areaGrad.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
      ctx.lineTo(points[0].x, height - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Draw Main Spline Stroke Line
      const strokeGrad = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0);
      strokeGrad.addColorStop(0, '#6366f1');
      strokeGrad.addColorStop(0.5, '#a855f7');
      strokeGrad.addColorStop(1, '#ec4899');

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].x, points[points.length - 1].y);
      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Draw Data Point Nodes
    points.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });

    // Draw Active Hovered Point Indicator if any
    if (state.hoveredDataPoint) {
      const hp = state.hoveredDataPoint;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(hp.x, padding.top);
      ctx.lineTo(hp.x, height - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ec4899';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }

  function handleChartMouseMove(e) {
    if (!cachedChartPoints.length) return;
    const canvas = document.getElementById('timeSeriesCanvas');
    const tooltip = document.getElementById('chartTooltip');
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find closest data point along X axis
    let closest = cachedChartPoints[0];
    let minDist = Math.abs(mouseX - closest.x);

    for (let i = 1; i < cachedChartPoints.length; i++) {
      const dist = Math.abs(mouseX - cachedChartPoints[i].x);
      if (dist < minDist) {
        minDist = dist;
        closest = cachedChartPoints[i];
      }
    }

    if (minDist < 60) {
      state.hoveredDataPoint = closest;
      renderTimeSeriesChart();

      if (tooltip) {
        tooltip.style.display = 'block';
        tooltip.style.left = `${Math.min(Math.max(closest.x - 70, 10), rect.width - 200)}px`;
        tooltip.style.top = `${Math.max(closest.y - 100, 10)}px`;

        const d = closest.data;
        const breakdownHtml = Object.entries(d.breakdown || {})
          .slice(0, 4)
          .map(([cat, amt]) => `<div><span>${CATEGORY_META[cat]?.icon || '•'} ${cat}:</span> <strong>${formatCurrency(amt)}</strong></div>`)
          .join('');

        tooltip.innerHTML = `
          <div class="tooltip-date">${d.fullLabel || d.label}</div>
          <div class="tooltip-total">${formatCurrency(d.total)}</div>
          <div class="tooltip-breakdown">${breakdownHtml}</div>
        `;
      }
    } else {
      handleChartMouseLeave();
    }
  }

  function handleChartMouseLeave() {
    state.hoveredDataPoint = null;
    const tooltip = document.getElementById('chartTooltip');
    if (tooltip) tooltip.style.display = 'none';
    renderTimeSeriesChart();
  }

  function aggregateTimeSeries(transactions, interval) {
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    const groups = {};

    sorted.forEach(t => {
      let key = t.date;
      let label = t.date;
      let fullLabel = t.date;

      if (interval === 'monthly') {
        const parts = t.date.split('-');
        key = `${parts[0]}-${parts[1]}`;
        label = getMonthShortName(t.date) + ' ' + parts[0].slice(2);
        fullLabel = getMonthName(t.date) + ' ' + parts[0];
      } else if (interval === 'weekly') {
        const d = new Date(t.date);
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        key = startOfWeek.toISOString().split('T')[0];
        label = `Wk of ${formatDateFriendly(key)}`;
        fullLabel = label;
      } else {
        // Daily
        label = formatDateFriendly(t.date);
        fullLabel = label;
      }

      if (!groups[key]) {
        groups[key] = { key, label, fullLabel, total: 0, breakdown: {} };
      }

      groups[key].total += t.amount;
      groups[key].breakdown[t.category] = (groups[key].breakdown[t.category] || 0) + t.amount;
    });

    return Object.values(groups);
  }

  function calculateNiceCeiling(num) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(num)));
    const firstDigit = num / magnitude;
    let multiplier;
    if (firstDigit <= 1) multiplier = 1.2;
    else if (firstDigit <= 2) multiplier = 2.5;
    else if (firstDigit <= 5) multiplier = 6;
    else multiplier = 10;
    return Math.ceil(multiplier * magnitude);
  }

  /**
   * CATEGORY DONUT CANVAS CHART
   */
  function renderDonutChart() {
    const canvas = document.getElementById('categoryDonutCanvas');
    if (!canvas) return;

    const { ctx, width, height } = setupHiDPICanvas(canvas);
    const data = state.filteredTransactions;

    const categorySpends = {};
    let totalSpend = 0;

    data.forEach(t => {
      categorySpends[t.category] = (categorySpends[t.category] || 0) + t.amount;
      totalSpend += t.amount;
    });

    const sortedCats = Object.entries(categorySpends).sort((a, b) => b[1] - a[1]);
    const donutCountEl = document.getElementById('donutTotalCount');
    if (donutCountEl) donutCountEl.textContent = sortedCats.length;

    if (!sortedCats.length || totalSpend === 0) {
      drawEmptyCanvas(ctx, width, height, 'No categories');
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 10;
    const innerRadius = outerRadius * 0.65;

    let startAngle = -Math.PI / 2;

    sortedCats.forEach(([cat, amt]) => {
      const sliceAngle = (amt / totalSpend) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;
      const color = CATEGORY_META[cat]?.color || '#94a3b8';

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();

      // Border cut
      ctx.lineWidth = 2.5;
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.strokeStyle = isDark ? '#111827' : '#ffffff';
      ctx.stroke();

      startAngle = endAngle;
    });
  }

  function renderCategoryLegend() {
    const legendList = document.getElementById('categoryLegendList');
    if (!legendList) return;

    const data = state.filteredTransactions;
    const categorySpends = {};
    let total = 0;

    data.forEach(t => {
      categorySpends[t.category] = (categorySpends[t.category] || 0) + t.amount;
      total += t.amount;
    });

    const sortedCats = Object.entries(categorySpends).sort((a, b) => b[1] - a[1]);

    if (!sortedCats.length) {
      legendList.innerHTML = '<div class="empty-sub">No categories in current filter</div>';
      return;
    }

    legendList.innerHTML = sortedCats.map(([cat, amt]) => {
      const meta = CATEGORY_META[cat] || { icon: '🏷️', color: '#94a3b8', name: cat };
      const pct = total > 0 ? ((amt / total) * 100).toFixed(1) : 0;
      const isActive = state.filters.category === cat;

      return `
        <div class="cat-legend-item ${isActive ? 'active' : ''}" data-category="${escapeHTML(cat)}" title="Click to filter by ${escapeHTML(cat)}">
          <div class="cat-info-wrap">
            <span class="cat-color-dot" style="background: ${meta.color};"></span>
            <span class="cat-icon">${meta.icon}</span>
            <span class="cat-name">${escapeHTML(cat)}</span>
          </div>
          <div class="cat-spend-wrap">
            <span class="cat-spend-val">${formatCurrency(amt)}</span>
            <span class="cat-percent-val">${pct}%</span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events to filter by category
    legendList.querySelectorAll('.cat-legend-item').forEach(item => {
      item.addEventListener('click', () => {
        const cat = item.getAttribute('data-category');
        toggleCategoryFilter(cat);
      });
    });
  }

  function toggleCategoryFilter(cat) {
    const catSelect = document.getElementById('filterCategory');
    if (state.filters.category === cat) {
      state.filters.category = 'all';
      if (catSelect) catSelect.value = 'all';
      showToast(`Cleared category filter`);
    } else {
      state.filters.category = cat;
      if (catSelect) catSelect.value = cat;
      showToast(`Filtered by ${cat}`);
    }
    applyFilters();
  }

  function drawEmptyCanvas(ctx, width, height, text) {
    ctx.clearRect(0, 0, width, height);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  }

  /* --------------------------------------------------------------------------
   * 12. MERCHANT LEADERBOARD & AI-STYLE INSIGHTS
   * -------------------------------------------------------------------------- */
  function renderMerchantAnalysis() {
    const listEl = document.getElementById('merchantsList');
    if (!listEl) return;

    const data = state.filteredTransactions;
    const merchants = {};
    let maxSpend = 0;

    data.forEach(t => {
      if (!merchants[t.merchant]) {
        merchants[t.merchant] = { name: t.merchant, total: 0, count: 0, category: t.category };
      }
      merchants[t.merchant].total += t.amount;
      merchants[t.merchant].count += 1;
      if (merchants[t.merchant].total > maxSpend) {
        maxSpend = merchants[t.merchant].total;
      }
    });

    const sorted = Object.values(merchants).sort((a, b) => b.total - a.total).slice(0, 6);

    if (!sorted.length) {
      listEl.innerHTML = '<div class="empty-sub">No merchants recorded</div>';
      return;
    }

    listEl.innerHTML = sorted.map((m, idx) => {
      const pct = maxSpend > 0 ? (m.total / maxSpend) * 100 : 0;
      return `
        <div class="merchant-rank-row" data-merchant="${escapeHTML(m.name)}" title="Click to filter by ${escapeHTML(m.name)}">
          <span class="m-rank-num">#${idx + 1}</span>
          <div class="m-detail-block">
            <div class="m-row-top">
              <span class="m-name">${escapeHTML(m.name)}</span>
              <span class="m-total">${formatCurrency(m.total)}</span>
            </div>
            <div class="m-bar-bg">
              <div class="m-bar-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="m-count-tag">${m.count} checkout${m.count === 1 ? '' : 's'} recorded</span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events to filter by merchant
    listEl.querySelectorAll('.merchant-rank-row').forEach(row => {
      row.addEventListener('click', () => {
        const merch = row.getAttribute('data-merchant');
        const merchSelect = document.getElementById('filterMerchant');
        if (state.filters.merchant === merch) {
          state.filters.merchant = 'all';
          if (merchSelect) merchSelect.value = 'all';
          showToast('Cleared merchant filter');
        } else {
          state.filters.merchant = merch;
          if (merchSelect) merchSelect.value = merch;
          showToast(`Filtered by ${merch}`);
        }
        applyFilters();
      });
    });
  }

  /**
   * Generates dynamic rule-based algorithmic findings (AI-style insights)
   */
  function renderInsights() {
    const feed = document.getElementById('insightsFeed');
    if (!feed) return;

    const data = state.filteredTransactions;
    if (!data.length) {
      feed.innerHTML = '<div class="empty-sub">No transactions to analyze</div>';
      return;
    }

    const insights = generateInsights(data);

    feed.innerHTML = insights.map(item => `
      <div class="insight-card">
        <div class="insight-brain-icon">${item.icon}</div>
        <div class="insight-body">
          <span class="insight-tag">${escapeHTML(item.tag)}</span>
          <p class="insight-text">${item.text}</p>
          <p class="insight-subtext">${item.sub}</p>
        </div>
      </div>
    `).join('');
  }

  function generateInsights(data) {
    const insights = [];
    const totalSpend = data.reduce((sum, t) => sum + t.amount, 0);

    // 1. Day of week distribution
    const dayTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun..Sat
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let weekendSpend = 0;
    let weekdaySpend = 0;

    data.forEach(t => {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        const dayIdx = d.getDay();
        dayTotals[dayIdx] += t.amount;
        if (dayIdx === 0 || dayIdx === 6) {
          weekendSpend += t.amount;
        } else {
          weekdaySpend += t.amount;
        }
      }
    });

    const maxDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
    const highestDayName = dayNames[maxDayIdx];

    insights.push({
      icon: '🧠',
      tag: 'Day-of-Week Rhythm',
      text: `${highestDayName} is your highest-spending day.`,
      sub: `You average higher transaction values on ${highestDayName}s compared to any other day of the week.`,
    });

    // 2. Weekend vs Weekday analysis
    if (totalSpend > 0) {
      const weekendPct = Math.round((weekendSpend / totalSpend) * 100);
      if (weekendPct >= 35) {
        insights.push({
          icon: '🍕',
          tag: 'Weekend Explorer',
          text: `You tend to spend more during weekends (${weekendPct}% of overall budget).`,
          sub: `Dining out, leisure trips, and relaxation activities spike significantly on Saturdays and Sundays.`,
        });
      }
    }

    // 3. Category dominance
    const categoryTotals = {};
    data.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length > 0) {
      const [topCat, topSpend] = sortedCats[0];
      const catPct = totalSpend > 0 ? Math.round((topSpend / totalSpend) * 100) : 0;
      insights.push({
        icon: CATEGORY_META[topCat]?.icon || '🏷️',
        tag: 'Dominant Category',
        text: `${topCat} represents ${catPct}% of your total spending.`,
        sub: `You allocated ${formatCurrency(topSpend)} towards ${topCat.toLowerCase()} items and services.`,
      });
    }

    // 4. Merchant Loyalty
    const merchantVisits = {};
    data.forEach(t => {
      merchantVisits[t.merchant] = (merchantVisits[t.merchant] || 0) + 1;
    });
    const sortedMerchants = Object.entries(merchantVisits).sort((a, b) => b[1] - a[1]);
    if (sortedMerchants.length > 0 && sortedMerchants[0][1] >= 2) {
      const [favMerch, visits] = sortedMerchants[0];
      insights.push({
        icon: '🏪',
        tag: 'Merchant Loyalty',
        text: `You visited ${favMerch} ${visits} times.`,
        sub: `This is your most frequented storefront in the selected timeframe.`,
      });
    }

    // 5. Checkout Ticket Size
    const avgTx = data.length > 0 ? Math.round(totalSpend / data.length) : 0;
    insights.push({
      icon: '📊',
      tag: 'Checkout Average',
      text: `Your average transaction is ${formatCurrency(avgTx)}.`,
      sub: `Based on an itemized analysis across ${data.length} registered receipts.`,
    });

    // 6. Seasonal Spikes
    const monthTotals = {};
    data.forEach(t => {
      const m = getMonthName(t.date);
      monthTotals[m] = (monthTotals[m] || 0) + t.amount;
    });
    const sortedMonths = Object.entries(monthTotals).sort((a, b) => b[1] - a[1]);
    if (sortedMonths.length > 0) {
      const [peakMonth, pSpend] = sortedMonths[0];
      insights.push({
        icon: '📈',
        tag: 'Peak Outflow',
        text: `Your spending increased significantly during ${peakMonth}.`,
        sub: `Total volume reached ${formatCurrency(pSpend)}, forming a seasonal peak in your financial year.`,
      });
    }

    return insights.slice(0, 5);
  }

  /* --------------------------------------------------------------------------
   * 13. LIFE TIMELINE VISUALIZATION
   * -------------------------------------------------------------------------- */
  function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    const data = [...state.filteredTransactions].sort((a, b) => b.date.localeCompare(a.date));
    if (!data.length) {
      container.innerHTML = '<div class="empty-sub">No transactions to display on timeline</div>';
      return;
    }

    // Group by Month & Year
    const monthGroups = {};
    data.forEach(t => {
      const parts = t.date.split('-');
      const key = `${parts[0]}-${parts[1]}`;
      if (!monthGroups[key]) {
        monthGroups[key] = {
          label: getMonthName(t.date) + ' ' + parts[0],
          total: 0,
          items: [],
        };
      }
      monthGroups[key].total += t.amount;
      monthGroups[key].items.push(t);
    });

    container.innerHTML = Object.values(monthGroups).map(group => {
      // Pick top 6 preview items
      const previews = group.items.slice(0, 6).map(item => {
        const icon = CATEGORY_META[item.category]?.icon || '🧾';
        return `
          <div class="timeline-item-card" data-id="${item.id}" title="Click to open receipt">
            <div class="t-item-left">
              <span class="t-item-icon">${icon}</span>
              <div>
                <span class="t-item-merchant">${escapeHTML(item.merchant)}</span>
                <span class="t-item-date">${formatDateFriendly(item.date)}</span>
              </div>
            </div>
            <span class="t-item-amount">${formatCurrency(item.amount)}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="timeline-month-block">
          <div class="timeline-month-marker"></div>
          <div class="timeline-month-header">
            <h3 class="timeline-month-title">${group.label}</h3>
            <span class="timeline-month-total">${formatCurrency(group.total)}</span>
          </div>
          <div class="timeline-items-grid">
            ${previews}
          </div>
        </div>
      `;
    }).join('');

    // Attach click events on timeline cards to open receipt modal
    container.querySelectorAll('.timeline-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        openReceiptModalById(id);
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 14. TRANSACTIONS TABLE & MOBILE CARDS
   * -------------------------------------------------------------------------- */
  function renderTransactionsTable() {
    const tableBody = document.getElementById('receiptTableBody');
    const mobileCards = document.getElementById('mobileReceiptCards');
    const emptyState = document.getElementById('tableEmptyState');
    const countEl = document.getElementById('tableResultsCount');

    let data = [...state.filteredTransactions];

    // Sorting
    const { sortColumn, sortAsc, currentPage, pageSize } = state.table;
    data.sort((a, b) => {
      let vA = a[sortColumn];
      let vB = b[sortColumn];

      if (sortColumn === 'amount') {
        return sortAsc ? vA - vB : vB - vA;
      }
      if (typeof vA === 'string') {
        return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      return 0;
    });

    if (countEl) {
      countEl.textContent = `Showing ${data.length.toLocaleString()} transaction${data.length === 1 ? '' : 's'}`;
    }

    if (!data.length) {
      if (tableBody) tableBody.innerHTML = '';
      if (mobileCards) mobileCards.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      renderPagination(0);
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Paginate
    const totalPages = Math.ceil(data.length / pageSize) || 1;
    const page = Math.min(Math.max(currentPage, 1), totalPages);
    const start = (page - 1) * pageSize;
    const pageItems = data.slice(start, start + pageSize);

    // Desktop Table HTML
    if (tableBody) {
      tableBody.innerHTML = pageItems.map(tx => {
        const meta = CATEGORY_META[tx.category] || { icon: '🏷️', color: '#94a3b8' };
        return `
          <tr data-id="${tx.id}">
            <td class="td-date">${formatDateFriendly(tx.date)}</td>
            <td class="td-merchant">
              <div>${escapeHTML(tx.merchant)}</div>
              ${tx.anomalyFlag ? `<div class="anomaly-badge" title="Merchant distance: ${tx.distanceKm ? Math.round(tx.distanceKm).toLocaleString() + ' km' : '> 500 km'}">${escapeHTML(tx.anomalyFlag)}</div>` : ''}
            </td>
            <td>
              <span class="td-category-badge">
                <span>${meta.icon}</span>
                <span>${escapeHTML(tx.category)}</span>
              </span>
            </td>
            <td class="td-item" title="${escapeHTML(tx.item)}">${escapeHTML(tx.item)}</td>
            <td class="td-amount text-right ${tx.isIncome ? 'income' : ''}">${formatCurrency(tx.amount)}</td>
            <td class="td-payment">${escapeHTML(tx.paymentMethod)}</td>
            <td class="text-center">
              <button class="btn btn-outline btn-sm view-tx-btn" data-id="${tx.id}">View</button>
            </td>
          </tr>
        `;
      }).join('');

      tableBody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', (e) => {
          const id = row.getAttribute('data-id');
          openReceiptModalById(id);
        });
      });
    }

    // Mobile Cards View
    if (mobileCards) {
      mobileCards.innerHTML = pageItems.map(tx => {
        const meta = CATEGORY_META[tx.category] || { icon: '🏷️', color: '#94a3b8' };
        return `
          <div class="m-tx-card" data-id="${tx.id}">
            <div class="m-tx-header">
              <div class="m-tx-merchant">
                <div>${escapeHTML(tx.merchant)}</div>
                ${tx.anomalyFlag ? `<div class="anomaly-badge" style="margin-top: 4px;">${escapeHTML(tx.anomalyFlag)}</div>` : ''}
              </div>
              <div class="m-tx-amount ${tx.isIncome ? 'income' : ''}">${formatCurrency(tx.amount)}</div>
            </div>
            <div class="m-tx-body">
              <span>${formatDateFriendly(tx.date)} • ${meta.icon} ${escapeHTML(tx.category)}</span>
              <span>${escapeHTML(tx.paymentMethod)}</span>
            </div>
          </div>
        `;
      }).join('');

      mobileCards.querySelectorAll('.m-tx-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-id');
          openReceiptModalById(id);
        });
      });
    }

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    const footer = document.getElementById('paginationFooter');
    const info = document.getElementById('paginationInfo');
    const buttonsContainer = document.getElementById('paginationButtons');

    if (!footer || !info || !buttonsContainer) return;

    if (totalPages <= 1) {
      info.textContent = `Page 1 of 1`;
      buttonsContainer.innerHTML = '';
      return;
    }

    const cur = state.table.currentPage;
    info.textContent = `Page ${cur} of ${totalPages}`;

    let btns = '';
    btns += `<button class="page-btn" id="prevPageBtn" ${cur === 1 ? 'disabled' : ''}>← Prev</button>`;

    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, cur - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      btns += `<button class="page-btn ${i === cur ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    btns += `<button class="page-btn" id="nextPageBtn" ${cur === totalPages ? 'disabled' : ''}>Next →</button>`;
    buttonsContainer.innerHTML = btns;

    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (state.table.currentPage > 1) {
        changePage(state.table.currentPage - 1);
      }
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (state.table.currentPage < totalPages) {
        changePage(state.table.currentPage + 1);
      }
    });

    buttonsContainer.querySelectorAll('.page-btn[data-page]').forEach(b => {
      b.addEventListener('click', () => {
        const p = parseInt(b.getAttribute('data-page'), 10);
        changePage(p);
      });
    });
  }

  function changePage(p) {
    state.table.currentPage = p;
    renderTransactionsTable();
  }

  /* --------------------------------------------------------------------------
   * 15. RECEIPT DETAILS MODAL
   * -------------------------------------------------------------------------- */
  function openReceiptModalById(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    const overlay = document.getElementById('receiptModalOverlay');
    if (!overlay) return;

    const merchEl = document.getElementById('modalMerchant');
    const locEl = document.getElementById('modalLocation');
    const dateEl = document.getElementById('modalDate');
    const catEl = document.getElementById('modalCategory');
    const itemsList = document.getElementById('modalItemsList');
    const subtotalEl = document.getElementById('modalSubtotal');
    const totalEl = document.getElementById('modalTotalAmount');
    const payEl = document.getElementById('modalPayment');
    const refEl = document.getElementById('modalReceiptId');
    const anomalyContainer = document.getElementById('modalAnomalyContainer');

    if (merchEl) merchEl.textContent = tx.merchant;
    if (locEl) locEl.textContent = tx.location || 'Local Store';
    if (dateEl) dateEl.textContent = formatDateFriendly(tx.date) + ' • Verified';

    const meta = CATEGORY_META[tx.category] || { icon: '🧾' };
    if (catEl) catEl.textContent = `${meta.icon} ${tx.category}`;

    if (anomalyContainer) {
      if (tx.anomalyFlag) {
        anomalyContainer.style.display = 'block';
        anomalyContainer.innerHTML = `
          <div class="anomaly-badge" style="font-size: 0.82rem; padding: 6px 14px; justify-content: center; width: 100%; box-sizing: border-box;">
            ${escapeHTML(tx.anomalyFlag)}${tx.distanceKm ? ` • Distance: ${Math.round(tx.distanceKm).toLocaleString()} km` : ''}
          </div>
        `;
      } else {
        anomalyContainer.style.display = 'none';
        anomalyContainer.innerHTML = '';
      }
    }

    if (itemsList) {
      itemsList.innerHTML = `
        <div class="m-item-row">
          <span class="item-name">${escapeHTML(tx.item)}</span>
          <span class="item-qty">x${tx.quantity || 1}</span>
          <span class="item-price ${tx.isIncome ? 'income' : ''}">${formatCurrency(tx.amount)}</span>
        </div>
      `;
    }

    if (subtotalEl) subtotalEl.textContent = formatCurrency(tx.amount);
    if (totalEl) {
      if (tx.isIncome) {
        totalEl.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 800;">+${formatCurrency(tx.amount)}</span>`;
      } else {
        totalEl.textContent = formatCurrency(tx.amount);
      }
    }
    if (payEl) payEl.textContent = tx.paymentMethod || 'Card / UPI';
    if (refEl) refEl.textContent = tx.id;

    overlay.classList.add('open');
  }

  function closeReceiptModal() {
    const overlay = document.getElementById('receiptModalOverlay');
    if (overlay) overlay.classList.remove('open');
  }

  /* --------------------------------------------------------------------------
   * 16. DATASET UPLOAD MODAL & COLUMN MAPPING MODAL
   * -------------------------------------------------------------------------- */
  function openUploadModal() {
    const overlay = document.getElementById('uploadModalOverlay');
    if (overlay) overlay.classList.add('open');
    resetUploadModalUI();
  }

  function closeUploadModal() {
    const overlay = document.getElementById('uploadModalOverlay');
    if (overlay) overlay.classList.remove('open');
    resetUploadModalUI();
  }

  function resetUploadModalUI() {
    const dropzone = document.getElementById('fileDropzone');
    const progress = document.getElementById('uploadProgressWrap');
    const mapping = document.getElementById('columnMappingContainer');

    if (dropzone) dropzone.style.display = 'block';
    if (progress) progress.style.display = 'none';
    if (mapping) mapping.style.display = 'none';

    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  }

  /* --------------------------------------------------------------------------
   * 17. EXPORT ENGINE (CSV & JSON BLOB DOWNLOAD & REPORT PRINT)
   * -------------------------------------------------------------------------- */
  function exportFilteredCSV() {
    const data = state.filteredTransactions;
    if (!data.length) {
      showToast('⚠️ No transactions to export');
      return;
    }

    const headers = ['Date', 'Merchant', 'Category', 'Item', 'Amount', 'Payment_Method', 'Location'];
    const rows = data.map(t => [
      t.date,
      `"${t.merchant.replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.item.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.paymentMethod.replace(/"/g, '""')}"`,
      `"${t.location.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadBlob(csvContent, 'text/csv;charset=utf-8;', 'your_life_in_receipts_filtered.csv');
    showToast('📥 Filtered CSV downloaded');
  }

  function exportFilteredJSON() {
    const data = state.filteredTransactions;
    if (!data.length) {
      showToast('⚠️ No transactions to export');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    downloadBlob(jsonContent, 'application/json;charset=utf-8;', 'your_life_in_receipts_filtered.json');
    showToast('📥 Filtered JSON downloaded');
  }

  function downloadSampleCSV() {
    const sampleRows = [
      'date,merchant,amount,category,item,quantity,payment_method,location',
      '2026-03-15,Swiggy,840,Food,Truffles Burger Combo,2,UPI,Bengaluru',
      '2026-03-14,Starbucks Coffee,450,Food,Caramel Frappuccino,1,UPI,Indiranagar',
      '2026-03-12,Uber,380,Transport,Airport Ride,1,UPI,Bengaluru',
      '2026-03-10,Amazon,3499,Shopping,Desk Mat & Organizer,2,Credit Card,Online',
      '2026-03-08,Zara,5490,Shopping,Linen Shirt,1,Credit Card,Mall',
      '2026-03-05,Blinkit,1120,Essentials,Groceries & Milk,4,UPI,Koramangala',
      '2026-03-02,Apple Store,24900,Tech,AirPods Pro 2,1,Credit Card,Store',
    ].join('\n');

    downloadBlob(sampleRows, 'text/csv;charset=utf-8;', 'sample_receipts_template.csv');
    showToast('📥 Sample CSV Template downloaded');
  }

  function downloadBlob(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* --------------------------------------------------------------------------
   * 18. EVENT LISTENERS
   * -------------------------------------------------------------------------- */
  function setupEventListeners() {
    // Navigation Hamburger
    const menuBtn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileDrawer');
    if (menuBtn && drawer) {
      menuBtn.addEventListener('click', () => {
        drawer.classList.toggle('open');
      });
      drawer.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => drawer.classList.remove('open'));
      });
    }

    // Upload & Demo Buttons
    const uploadTriggers = ['navUploadBtn', 'heroUploadBtn', 'mobileUploadBtn', 'footerUploadLink'];
    uploadTriggers.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', (e) => {
        e.preventDefault();
        openUploadModal();
      });
    });

    const demoTriggers = ['navDemoBtn', 'heroDemoBtn', 'mobileDemoBtn', 'footerDemoLink'];
    demoTriggers.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', (e) => {
        e.preventDefault();
        loadDemoDataset();
      });
    });

    // Modals Close
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalDoneBtn = document.getElementById('modalDoneBtn');
    const uploadModalCloseBtn = document.getElementById('uploadModalCloseBtn');

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeReceiptModal);
    if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeReceiptModal);
    if (uploadModalCloseBtn) uploadModalCloseBtn.addEventListener('click', closeUploadModal);

    const receiptOverlay = document.getElementById('receiptModalOverlay');
    if (receiptOverlay) {
      receiptOverlay.addEventListener('click', (e) => {
        if (e.target === receiptOverlay) closeReceiptModal();
      });
    }

    const uploadOverlay = document.getElementById('uploadModalOverlay');
    if (uploadOverlay) {
      uploadOverlay.addEventListener('click', (e) => {
        if (e.target === uploadOverlay) closeUploadModal();
      });
    }

    // Modal Print Buttons
    const modalPrintBtn = document.getElementById('modalPrintBtn');
    if (modalPrintBtn) {
      modalPrintBtn.addEventListener('click', () => window.print());
    }

    const exportReportBtn = document.getElementById('exportReportBtn');
    if (exportReportBtn) {
      exportReportBtn.addEventListener('click', () => window.print());
    }

    // Dropzone & File Input
    const dropzone = document.getElementById('fileDropzone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseFilesBtn');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
    }
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        if (e.target !== browseBtn) fileInput.click();
      });

      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          handleUploadedFiles(files);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleUploadedFiles(e.target.files);
        }
      });
    }

    // Column Mapping Confirm & Cancel
    const mapConfirmBtn = document.getElementById('mappingConfirmBtn');
    const mapCancelBtn = document.getElementById('mappingCancelBtn');

    if (mapConfirmBtn) {
      mapConfirmBtn.addEventListener('click', () => {
        const mapping = {
          date: document.getElementById('mapField_date')?.value || '',
          merchant: document.getElementById('mapField_merchant')?.value || '',
          amount: document.getElementById('mapField_amount')?.value || '',
          category: document.getElementById('mapField_category')?.value || '',
          item: document.getElementById('mapField_item')?.value || '',
          quantity: document.getElementById('mapField_quantity')?.value || '',
          paymentMethod: document.getElementById('mapField_paymentMethod')?.value || '',
          location: document.getElementById('mapField_location')?.value || '',
        };

        if (!mapping.date || !mapping.merchant || !mapping.amount) {
          showToast('⚠️ Date, Merchant, and Amount are required fields!');
          return;
        }

        applyColumnMappingAndFinish(mapping, state.pendingDataRows);
      });
    }

    if (mapCancelBtn) {
      mapCancelBtn.addEventListener('click', resetUploadModalUI);
    }

    // Sample Format Accordion
    const formatToggle = document.getElementById('formatHelpToggle');
    const formatContent = document.getElementById('formatHelpContent');
    const helpArrow = document.getElementById('helpArrow');
    if (formatToggle && formatContent) {
      formatToggle.addEventListener('click', () => {
        const isOpen = formatContent.style.display !== 'none';
        formatContent.style.display = isOpen ? 'none' : 'block';
        if (helpArrow) helpArrow.textContent = isOpen ? '▼' : '▲';
      });
    }

    const downloadSampleBtn = document.getElementById('downloadSampleCsvBtn');
    if (downloadSampleBtn) {
      downloadSampleBtn.addEventListener('click', downloadSampleCSV);
    }

    // Global Search & Input Debounce
    const searchInput = document.getElementById('globalSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          state.filters.search = e.target.value.trim();
          applyFilters();
        }, 200);
      });
    }

    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.filters.search = '';
        applyFilters();
      });
    }

    // Filter Controls
    const dateRangeSelect = document.getElementById('filterDateRange');
    const customDateInputs = document.getElementById('customDateRangeInputs');
    const startDateInput = document.getElementById('filterStartDate');
    const endDateInput = document.getElementById('filterEndDate');

    if (dateRangeSelect) {
      dateRangeSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        state.filters.dateRange = val;
        if (val === 'custom') {
          if (customDateInputs) customDateInputs.style.display = 'flex';
        } else {
          if (customDateInputs) customDateInputs.style.display = 'none';
          applyFilters();
        }
      });
    }

    if (startDateInput) {
      startDateInput.addEventListener('change', (e) => {
        state.filters.startDate = e.target.value;
        applyFilters();
      });
    }

    if (endDateInput) {
      endDateInput.addEventListener('change', (e) => {
        state.filters.endDate = e.target.value;
        applyFilters();
      });
    }

    const catFilterSelect = document.getElementById('filterCategory');
    if (catFilterSelect) {
      catFilterSelect.addEventListener('change', (e) => {
        state.filters.category = e.target.value;
        applyFilters();
      });
    }

    const merchFilterSelect = document.getElementById('filterMerchant');
    if (merchFilterSelect) {
      merchFilterSelect.addEventListener('change', (e) => {
        state.filters.merchant = e.target.value;
        applyFilters();
      });
    }

    const payFilterSelect = document.getElementById('filterPayment');
    if (payFilterSelect) {
      payFilterSelect.addEventListener('change', (e) => {
        state.filters.paymentMethod = e.target.value;
        applyFilters();
      });
    }

    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', resetFilters);
    }

    const emptyResetBtn = document.getElementById('emptyResetBtn');
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', resetFilters);
    }

    // Download Data Dropdown Menu
    const downloadDataBtn = document.getElementById('downloadDataBtn');
    const downloadMenu = document.getElementById('downloadMenu');

    if (downloadDataBtn && downloadMenu) {
      downloadDataBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadMenu.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        downloadMenu.classList.remove('show');
      });
    }

    const downloadCsvBtn = document.getElementById('downloadCsvBtn');
    if (downloadCsvBtn) {
      downloadCsvBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadMenu.classList.remove('show');
        exportFilteredCSV();
      });
    }

    const downloadJsonBtn = document.getElementById('downloadJsonBtn');
    if (downloadJsonBtn) {
      downloadJsonBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadMenu.classList.remove('show');
        exportFilteredJSON();
      });
    }

    const footerExportCsv = document.getElementById('footerExportCsv');
    if (footerExportCsv) {
      footerExportCsv.addEventListener('click', (e) => {
        e.preventDefault();
        exportFilteredCSV();
      });
    }

    const footerExportJson = document.getElementById('footerExportJson');
    if (footerExportJson) {
      footerExportJson.addEventListener('click', (e) => {
        e.preventDefault();
        exportFilteredJSON();
      });
    }

    // Table Column Sorting
    const sortHeaders = document.querySelectorAll('#receiptTable th.sortable');
    sortHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (state.table.sortColumn === col) {
          state.table.sortAsc = !state.table.sortAsc;
        } else {
          state.table.sortColumn = col;
          state.table.sortAsc = col === 'merchant' || col === 'category';
        }
        renderTransactionsTable();
      });
    });

    // Page Size Selector
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        state.table.pageSize = parseInt(e.target.value, 10);
        state.table.currentPage = 1;
        renderTransactionsTable();
      });
    }

    // Annual Recap (Wrapped) Year Selector
    const wrappedYearSelect = document.getElementById('wrappedYearSelect');
    if (wrappedYearSelect) {
      wrappedYearSelect.addEventListener('change', (e) => {
        state.wrappedYear = e.target.value;
        renderWrappedRecap();
      });
    }

    // Active Dataset Switcher Dropdown
    const datasetSelect = document.getElementById('datasetSelect');
    if (datasetSelect) {
      datasetSelect.addEventListener('change', (e) => {
        activateDataset(e.target.value);
        showToast('Switched active dataset');
      });
    }

    // Manage Datasets Modal
    const manageDatasetsBtn = document.getElementById('manageDatasetsBtn');
    const datasetsModalOverlay = document.getElementById('datasetsModalOverlay');
    const datasetsModalCloseBtn = document.getElementById('datasetsModalCloseBtn');
    const datasetsModalDoneBtn = document.getElementById('datasetsModalDoneBtn');
    const datasetsModalUploadBtn = document.getElementById('datasetsModalUploadBtn');
    const datasetsResetDemoBtn = document.getElementById('datasetsResetDemoBtn');

    if (manageDatasetsBtn && datasetsModalOverlay) {
      manageDatasetsBtn.addEventListener('click', () => {
        renderDatasetsManagerModal();
        datasetsModalOverlay.classList.add('open');
      });
    }

    if (datasetsModalCloseBtn && datasetsModalOverlay) {
      datasetsModalCloseBtn.addEventListener('click', () => datasetsModalOverlay.classList.remove('open'));
    }

    if (datasetsModalDoneBtn && datasetsModalOverlay) {
      datasetsModalDoneBtn.addEventListener('click', () => datasetsModalOverlay.classList.remove('open'));
    }

    if (datasetsResetDemoBtn && datasetsModalOverlay) {
      datasetsResetDemoBtn.addEventListener('click', () => {
        loadDemoDataset();
        datasetsModalOverlay.classList.remove('open');
      });
    }

    if (datasetsModalUploadBtn) {
      datasetsModalUploadBtn.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });
    }

    if (datasetsModalOverlay) {
      datasetsModalOverlay.addEventListener('click', (e) => {
        if (e.target === datasetsModalOverlay) datasetsModalOverlay.classList.remove('open');
      });
    }

    // Keyboard Shortcuts (Esc to close modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeReceiptModal();
        closeUploadModal();
        if (datasetsModalOverlay) datasetsModalOverlay.classList.remove('open');
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 19. UTILITY HELPERS
   * -------------------------------------------------------------------------- */
  function formatCurrency(num) {
    if (isNaN(num) || num == null) return state.isSpotify ? '0m' : '₹0';
    if (state.isSpotify && state.unitMode !== 'currency') {
      if (num >= 60) {
        const hrs = (num / 60).toFixed(1);
        return `${hrs} hrs (${Math.round(num).toLocaleString()}m)`;
      }
      return `${Math.round(num).toLocaleString()} mins`;
    }
    return '₹' + Math.round(num).toLocaleString('en-IN');
  }

  function formatCompactCurrency(num) {
    if (state.isSpotify && state.unitMode !== 'currency') {
      if (num >= 60) return `${(num / 60).toFixed(1)}h`;
      return `${Math.round(num)}m`;
    }
    if (num >= 10000000) return '₹' + (num / 10000000).toFixed(1) + 'Cr';
    if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return '₹' + (num / 1000).toFixed(0) + 'k';
    return '₹' + Math.round(num);
  }

  function formatDateFriendly(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${months[mIdx] || parts[1]} ${day}, ${parts[0]}`;
  }

  function getMonthName(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const idx = parseInt(parts[1], 10) - 1;
    return months[idx] || parts[1];
  }

  function getMonthShortName(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = parseInt(parts[1], 10) - 1;
    return months[idx] || parts[1];
  }

  function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) container.removeChild(toast);
      }, 300);
    }, 3200);
  }

  /* --------------------------------------------------------------------------
   * 20. VOICE-CONTROLLED ANALYTICS (WEB SPEECH API)
   * -------------------------------------------------------------------------- */
  function setupVoiceSearch() {
    const voiceBtn = document.getElementById('voiceSearchBtn');
    const searchInput = document.getElementById('globalSearchInput');
    if (!voiceBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      voiceBtn.addEventListener('click', () => {
        showToast('⚠️ Web Speech API is not supported in this browser. Try Chrome, Edge, or Safari.');
      });
      return;
    }

    let recognition = null;
    let isListening = false;

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('listening');
        voiceBtn.innerHTML = '🔴 Listening...';
        showToast('🎙️ Listening... Speak your search query');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        if (searchInput) {
          searchInput.value = transcript;
        }
        state.filters.search = transcript;
        applyFilters();
        showToast(`🔍 Voice filtered: "${transcript}"`);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          showToast(`⚠️ Voice recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '🎤 Voice Search';
      };

      voiceBtn.addEventListener('click', () => {
        if (isListening) {
          recognition.stop();
        } else {
          try {
            recognition.start();
          } catch (e) {
            console.warn('SpeechRecognition start error:', e);
          }
        }
      });
    } catch (err) {
      console.error('SpeechRecognition error:', err);
      voiceBtn.addEventListener('click', () => {
        showToast('⚠️ Voice recognition could not be initialized.');
      });
    }
  }

  /* --------------------------------------------------------------------------
   * 21. SCROLL-TRIGGERED STORYTELLING ANIMATIONS (INTERSECTION OBSERVER)
   * -------------------------------------------------------------------------- */
  function setupStoryCardScrollObserver() {
    const storyCards = document.querySelectorAll('.story-card');
    if (!storyCards.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            obs.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px'
      });

      storyCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.12}s`;
        observer.observe(card);
      });
    } else {
      storyCards.forEach(card => card.classList.add('animate-slide-up'));
    }
  }

  // Self-start on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
