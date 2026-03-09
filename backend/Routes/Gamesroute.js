const express = require('express');
const Gamesroute = express.Router();
const axios = require('axios');
const UserModel = require("../Models/User");
const crypto = require('crypto');
const GameHistory = require('../Models/Gameslogs');
const GameSession = require('../Models/GameSession');
const fs = require('fs').promises;
const path = require('path');
const GameModel = require('../Models/GameModel');

// ========================================= GAMING PART 
// Game Aggregator Configuration
const GAME_AGGREGATOR_CONFIG = {
  MERCHANT_ID: '5287a260dbfabb71d053ef30920494d3',
  MERCHANT_KEY: 'a5db176e5f441676a0beed6424a0460746ea70f9',
  BASE_API_URL: 'https://gis.slotegrator.com/api/index.php/v1'
};

// Signature calculation
function calculateXSign(params, merchantKey) {
  const cleanedParams = {};
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === undefined || value === null) return;

    if (typeof value === 'boolean') {
      cleanedParams[key] = value ? '1' : '0';
    } else if (typeof value === 'number') {
      cleanedParams[key] = value.toString();
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(subKey => {
            const subValue = item[subKey];
            if (subValue !== undefined && subValue !== null) {
              cleanedParams[`${key}[${index}][${subKey}]`] = subValue.toString();
            }
          });
        } else {
          cleanedParams[`${key}[${index}]`] = item.toString();
        }
      });
    } else if (typeof value === 'object') {
      cleanedParams[key] = JSON.stringify(value).replace(/"/g, '');
    } else {
      cleanedParams[key] = value.toString();
    }
  });

  let sortedKeys = null;
  let queryString = null;

  if (cleanedParams.action === "rollback") {
    const customOrder = [
      "X-Merchant-Id",
      "X-Nonce",
      "X-Timestamp",
      "action",
      "currency",
      "game_uuid",
      "player_id",
      "rollback_transactions",
      "session_id",
      "transaction_id",
      "type"
    ];

    sortedKeys = Object.keys(cleanedParams).sort((a, b) => {
      const indexA = customOrder.findIndex(prefix => a.startsWith(prefix));
      const indexB = customOrder.findIndex(prefix => b.startsWith(prefix));
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      if (indexA === indexB) {
        return a.localeCompare(b);
      }

      return indexA - indexB;
    });
  } else {
    sortedKeys = Object.keys(cleanedParams).sort();
  }

  queryString = sortedKeys
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(cleanedParams[key])}`)
    .join('&');

  return crypto.createHmac('sha1', merchantKey).update(queryString).digest('hex');
}

// Transaction tracking to prevent duplicates
const processedTransactions = new Map();
const TRANSACTION_CLEANUP_TIME = 5 * 60 * 1000;
// File path for storing games data
const GAMES_DATA_FILE = path.join(__dirname, '../data/games_data.json');
// Clean up old transactions periodically
setInterval(() => {
  const now = Date.now();
  for (const [transactionId, timestamp] of processedTransactions.entries()) {
    if (now - timestamp > TRANSACTION_CLEANUP_TIME) {
      processedTransactions.delete(transactionId);
    }
  }
}, TRANSACTION_CLEANUP_TIME);

// Session tracking to prevent game UUID changes mid-session
const activeSessions = new Map();
const SESSION_CLEANUP_TIME = 60 * 60 * 1000; // 1 hour

// Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, sessionData] of activeSessions.entries()) {
    if (now - sessionData.createdAt > SESSION_CLEANUP_TIME) {
      activeSessions.delete(sessionId);
    }
  }
}, SESSION_CLEANUP_TIME);

// Validate callback signature
function validateCallbackSignature(req, merchantKey) {
  try {
    const headers = {
      'X-Merchant-Id': req.headers['x-merchant-id'] || req.headers['X-Merchant-Id'],
      'X-Timestamp': req.headers['x-timestamp'] || req.headers['X-Timestamp'],
      'X-Nonce': req.headers['x-nonce'] || req.headers['X-Nonce'],
      'X-Sign': req.headers['x-sign'] || req.headers['X-Sign']
    };

    if (!headers['X-Merchant-Id'] || !headers['X-Timestamp'] ||
      !headers['X-Nonce'] || !headers['X-Sign']) {
      throw new Error('Missing required authentication headers');
    }

    const allParams = {
      ...req.body,
      'X-Merchant-Id': headers['X-Merchant-Id'],
      'X-Timestamp': headers['X-Timestamp'],
      'X-Nonce': headers['X-Nonce']
    };

    const expectedSign = calculateXSign(allParams, merchantKey);

    console.log("Signature validation:", {
      received: headers['X-Sign'],
      expected: expectedSign,
      params: allParams
    });

    if (headers['X-Sign'] !== expectedSign) {
      throw new Error('Invalid signature');
    }

    return headers;
  } catch (error) {
    throw error;
  }
}

// ========================================= GAMES DATA MANAGEMENT =========================================

/**
 * Fetch all games from the API with pagination handling
 */
async function fetchAllGames() {
  let allGames = [];
  let currentPage = 1;
  let totalPages = 1;
  let hasMorePages = true;

  console.log('Starting to fetch all games from API...');

  try {
    while (hasMorePages && currentPage <= 100) { // Safety limit of 100 pages
      console.log(`Fetching page ${currentPage}...`);

      const headers = {
        'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
        'X-Timestamp': Math.floor(Date.now() / 1000),
        'X-Nonce': crypto.randomBytes(16).toString('hex')
      };

      const params = { 
        expand: 'tags,parameters,images,related_games',
        page: currentPage
      };
      
      const xSign = calculateXSign({ ...params, ...headers }, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

      const response = await axios.get(`${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/games`, {
        params,
        headers: { ...headers, 'X-Sign': xSign },
        timeout: 30000
      });

      const responseData = response.data;

      // Add games from current page to our collection
      if (responseData.items && Array.isArray(responseData.items)) {
        allGames = allGames.concat(responseData.items);
        console.log(`Fetched ${responseData.items.length} games from page ${currentPage}`);
      }

      // Check pagination metadata
      const totalCount = parseInt(response.headers['x-pagination-total-count'] || 
                                (responseData._meta && responseData._meta.totalCount) || 0);
      const perPage = parseInt(response.headers['x-pagination-per-page'] || 
                             (responseData._meta && responseData._meta.perPage) || 20);
      
      if (totalCount > 0 && perPage > 0) {
        totalPages = Math.ceil(totalCount / perPage);
        console.log(`Total games: ${totalCount}, Per page: ${perPage}, Total pages: ${totalPages}`);
      }

      // Check if we have more pages
      if (currentPage >= totalPages) {
        hasMorePages = false;
      } else {
        currentPage++;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Successfully fetched ${allGames.length} games from API`);
    return allGames;

  } catch (error) {
    console.error('Error fetching games from API:', error.message);
    throw error;
  }
}

/**
 * Create backup of games data file
 */
async function backupGamesData() {
  try {
    try {
      await fs.access(GAMES_DATA_FILE);
      const backupFile = GAMES_DATA_FILE + '.backup';
      const data = await fs.readFile(GAMES_DATA_FILE, 'utf8');
      await fs.writeFile(backupFile, data);
      console.log(`Games data backup created: ${backupFile}`);
    } catch {
      // File doesn't exist, no backup needed
    }
  } catch (error) {
    console.error('Failed to create backup:', error.message);
  }
}

/**
 * Save games data to file
 */
async function saveGamesToFile(gamesData) {
  try {
    // Create backup first
    await backupGamesData();
    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(GAMES_DATA_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Save games data with timestamp
    const dataToSave = {
      lastUpdated: new Date().toISOString(),
      games: gamesData,
      totalGames: gamesData.length
    };

    // Write to temporary file first, then rename (atomic operation)
    const tempFile = GAMES_DATA_FILE + '.tmp';
    await fs.writeFile(tempFile, JSON.stringify(dataToSave, null, 2));
    await fs.rename(tempFile, GAMES_DATA_FILE);
    
    console.log(`Games data saved to ${GAMES_DATA_FILE}`);
    
    return dataToSave;
  } catch (error) {
    console.error('Error saving games data to file:', error.message);
    throw error;
  }
}

/**
 * Load games data from file
 */
async function loadGamesFromFile() {
  try {
    const data = await fs.readFile(GAMES_DATA_FILE, 'utf8');
    
    // Check if file is empty or contains only whitespace
    if (!data.trim()) {
      console.log('Games data file is empty, returning empty data');
      return {
        lastUpdated: null,
        games: [],
        totalGames: 0
      };
    }
    
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error('JSON parse error, file might be corrupted:', parseError.message);
      // Return empty data if JSON is invalid
      return {
        lastUpdated: null,
        games: [],
        totalGames: 0
      };
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Games data file not found, returning empty data');
      return {
        lastUpdated: null,
        games: [],
        totalGames: 0
      };
    }
    console.error('Error loading games data from file:', error.message);
    throw error;
  }
}

/**
 * Update games data (fetch from API and save to file)
 */
async function updateGamesData() {
  try {
    console.log('Updating games data from API...');
    const games = await fetchAllGames();
    const savedData = await saveGamesToFile(games);
    return savedData;
  } catch (error) {
    console.error('Failed to update games data:', error.message);
    throw error;
  }
}

// ========================================= GAMES DATA ENDPOINTS =========================================

/**
 * Endpoint to manually trigger games data update
 */
Gamesroute.post("/games/update", async (req, res) => {
  try {
    const updatedData = await updateGamesData();
    
    res.json({
      success: true,
      message: `Successfully updated games data with ${updatedData.totalGames} games`,
      data: {
        lastUpdated: updatedData.lastUpdated,
        totalGames: updatedData.totalGames
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update games data",
      error: error.message
    });
  }
});

/**
 * Endpoint to get games data (with optional filtering)
 */
Gamesroute.get("/games/data", async (req, res) => {
  try {
    // Load games data from file
    const gamesData = await loadGamesFromFile();
    
    // Define the important game categories to filter
    const importantCategories = [
      'slots',
      'casino',
      'fishing',
      'table',
      'roulette', 
      'crash',
      'dice',
      'card',
      'poker',
      'scratch card'
    ];
    
    // Fetch all active games from the database
    const allGames = await GameModel.find({ isActive: true });
    
    // Process games to separate instances for each category
    const processedGames = allGames.flatMap(game => {
      // Get the categories for the game, default to empty array if undefined
      const gameCategories = game.categories || [];
      
      // Filter categories to only include those in importantCategories (case-insensitive)
      const validCategories = gameCategories.filter(category =>
        importantCategories.some(impCat => 
          impCat.toLowerCase() === category.toLowerCase()
        )
      );
      
      // If no valid categories, return the game with an empty category
      if (validCategories.length === 0) {
        return [{
          ...game._doc, // Spread the game document
          displayCategory: '' // Add an empty category for games without valid categories
        }];
      }
      
      // Create a separate game entry for each valid category
      return validCategories.map(category => ({
        ...game._doc, // Spread the game document
        displayCategory: category // Add the specific category for this instance
      }));
    });
    
    // Filter games by category (case-insensitive) from file data for metadata
    const filteredGames = gamesData.games.filter(game => {
      if (!game.type) return false;
      
      const gameType = game.type.toLowerCase();
      return importantCategories.some(category => 
        gameType.includes(category.toLowerCase())
      );
    });
    
    // Send response to frontend
    res.json({
      success: true,
      data: {
        games: processedGames, // Send processed games with individual category entries
        metadata: {
          lastUpdated: gamesData.lastUpdated,
          totalGamesInCache: gamesData.totalGames,
          filteredGamesCount: filteredGames.length,
          categories: importantCategories
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load games data",
      error: error.message
    });
  }
});
/**
 * Endpoint to get game by UUID
 */
Gamesroute.get("/games/data/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    
    const gamesData = await loadGamesFromFile();
    const game = gamesData.games.find(g => g.uuid === uuid);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found"
      });
    }
    
    res.json({
      success: true,
      data: game
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load game data",
      error: error.message
    });
  }
});

/**
 * Endpoint to get games statistics
 */
Gamesroute.get("/games/stats", async (req, res) => {
  try {
    const gamesData = await loadGamesFromFile();
    
    // Calculate statistics
    const providers = {};
    const types = {};
    let hasLobbyCount = 0;
    let isMobileCount = 0;
    let hasFreespinsCount = 0;
    
    gamesData.games.forEach(game => {
      // Count by provider
      if (game.provider) {
        providers[game.provider] = (providers[game.provider] || 0) + 1;
      }
      
      // Count by type
      if (game.type) {
        types[game.type] = (types[game.type] || 0) + 1;
      }
      
      // Count flags
      if (game.has_lobby === 1) hasLobbyCount++;
      if (game.is_mobile === 1) isMobileCount++;
      if (game.has_freespins === 1) hasFreespinsCount++;
    });
    
    res.json({
      success: true,
      data: {
        totalGames: gamesData.games.length,
        lastUpdated: gamesData.lastUpdated,
        byProvider: providers,
        byType: types,
        hasLobby: hasLobbyCount,
        isMobile: isMobileCount,
        hasFreespins: hasFreespinsCount
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load games statistics",
      error: error.message
    });
  }
});

// ========================================= SCHEDULED UPDATES =========================================

// Schedule automatic games data updates (once per day)
const SCHEDULED_UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Flag to prevent multiple simultaneous updates
let isUpdating = false;

async function scheduleGamesUpdate() {
  try {
    // Check if we need initial update
    const existingData = await loadGamesFromFile();
    
    if (existingData.games.length === 0 || !existingData.lastUpdated) {
      console.log('No valid games data found, performing initial fetch...');
      await updateGamesData();
    } else {
      console.log(`Loaded ${existingData.games.length} games from cache (last updated: ${existingData.lastUpdated})`);
      
      // Check if data is too old and needs refresh
      const lastUpdated = new Date(existingData.lastUpdated);
      const now = new Date();
      const daysDiff = (now - lastUpdated) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 1) { // Refresh if data is older than 1 day
        console.log('Games data is outdated, performing refresh...');
        await updateGamesData();
      }
    }
    
    // Set up periodic updates
    setInterval(async () => {
      try {
        if (isUpdating) {
          console.log('Games update already in progress, skipping scheduled update');
          return;
        }
        
        isUpdating = true;
        console.log('Performing scheduled games data update...');
        await updateGamesData();
        isUpdating = false;
      } catch (error) {
        console.error('Scheduled games update failed:', error.message);
        isUpdating = false;
      }
    }, SCHEDULED_UPDATE_INTERVAL);
    
  } catch (error) {
    console.error('Initial games update failed:', error.message);
    
    // Retry after 5 minutes if initial update fails
    setTimeout(scheduleGamesUpdate, 5 * 60 * 1000);
  }
}

// Start the scheduled updates
// scheduleGamesUpdate();

// ========================================= EXISTING CODE =========================================

// Clean up old transactions periodically
setInterval(() => {
  const now = Date.now();
  for (const [transactionId, timestamp] of processedTransactions.entries()) {
    if (now - timestamp > TRANSACTION_CLEANUP_TIME) {
      processedTransactions.delete(transactionId);
    }
  }
}, TRANSACTION_CLEANUP_TIME);

// Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, sessionData] of activeSessions.entries()) {
    if (now - sessionData.createdAt > SESSION_CLEANUP_TIME) {
      activeSessions.delete(sessionId);
    }
  }
}, SESSION_CLEANUP_TIME);

// ----------------- Game Endpoints -----------------
// 1. Get Games List (API endpoint - not using our cached data)
Gamesroute.get("/games", async (req, res) => {
  try {
    const { expand } = req.query;
    const allGames = [];
    
    // First request to understand the response structure
    const initialHeaders = {
      'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      'X-Timestamp': Math.floor(Date.now() / 1000),
      'X-Nonce': crypto.randomBytes(16).toString('hex')
    };

    const initialParams = { page: 1 };
    if (expand) {
      initialParams.expand = expand;
    }

    const initialXSign = calculateXSign({ ...initialParams, ...initialHeaders }, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    // First request to understand the response structure
    const initialResponse = await axios.get(`${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/games`, {
      params: initialParams,
      headers: { ...initialHeaders, 'X-Sign': initialXSign }
    });

    console.log('=== FULL API RESPONSE STRUCTURE ===');
    console.log(JSON.stringify(initialResponse.data, null, 2));
    console.log('=== END OF RESPONSE STRUCTURE ===');

    // Let's check what keys are available in the response
    console.log('Response keys:', Object.keys(initialResponse.data));
    if (initialResponse.data.meta) {
      console.log('Meta keys:', Object.keys(initialResponse.data.meta));
    }
    if (initialResponse.data.pagination) {
      console.log('Pagination keys:', Object.keys(initialResponse.data.pagination));
    }

    // Try different common pagination structures
    let totalPages = 160; // Default to 151 as we know from your screenshot
    let currentPage = 1;

    if (initialResponse.data.meta && initialResponse.data.meta.pageCount) {
      totalPages = initialResponse.data.meta.pageCount;
      currentPage = initialResponse.data.meta.currentPage || 1;
    } else if (initialResponse.data.pagination && initialResponse.data.pagination.total_pages) {
      totalPages = initialResponse.data.pagination.total_pages;
      currentPage = initialResponse.data.pagination.current_page || 1;
    } else if (initialResponse.data.totalPages) {
      totalPages = initialResponse.data.totalPages;
      currentPage = initialResponse.data.currentPage || 1;
    } else {
      console.log('Using default totalPages: 151');
    }

    console.log(`Detected total pages: ${totalPages}, current page: ${currentPage}`);

    // Identify where the games data is stored
    let gamesData = [];
    if (initialResponse.data.data && Array.isArray(initialResponse.data.data)) {
      gamesData = initialResponse.data.data;
    } else if (initialResponse.data.games && Array.isArray(initialResponse.data.games)) {
      gamesData = initialResponse.data.games;
    } else if (initialResponse.data.items && Array.isArray(initialResponse.data.items)) {
      gamesData = initialResponse.data.items;
    } else if (Array.isArray(initialResponse.data)) {
      gamesData = initialResponse.data; // If response is directly an array
    }

    console.log(`Found ${gamesData.length} games on first page`);
    allGames.push(...gamesData);

    // Fetch remaining pages (from 2 to totalPages)
    for (let page = 2; page <= totalPages; page++) {
      console.log(`Fetching page ${page} of ${totalPages}...`);
      
      const pageHeaders = {
        'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
        'X-Timestamp': Math.floor(Date.now() / 1000),
        'X-Nonce': crypto.randomBytes(16).toString('hex')
      };

      const pageParams = { page };
      if (expand) {
        pageParams.expand = expand;
      }

      const pageXSign = calculateXSign({ ...pageParams, ...pageHeaders }, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

      try {
        const pageResponse = await axios.get(`${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/games`, {
          params: pageParams,
          headers: { ...pageHeaders, 'X-Sign': pageXSign }
        });

        // Extract games data from response based on structure
        let pageGamesData = [];
        if (pageResponse.data.data && Array.isArray(pageResponse.data.data)) {
          pageGamesData = pageResponse.data.data;
        } else if (pageResponse.data.games && Array.isArray(pageResponse.data.games)) {
          pageGamesData = pageResponse.data.games;
        } else if (pageResponse.data.items && Array.isArray(pageResponse.data.items)) {
          pageGamesData = pageResponse.data.items;
        } else if (Array.isArray(pageResponse.data)) {
          pageGamesData = pageResponse.data;
        }

        allGames.push(...pageGamesData);
        console.log(`Added ${pageGamesData.length} games from page ${page}`);
        
      } catch (pageError) {
        console.error(`Error fetching page ${page}:`, pageError.message);
        // Continue with next pages instead of failing completely
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Successfully fetched ${allGames.length} games from ${totalPages} pages`);
    
    res.json({
      success: true,
      data: allGames,
      meta: {
        totalGames: allGames.length,
        totalPages: totalPages,
        message: `Fetched all games from ${totalPages} pages`
      }
    });
    
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch games list",
      error: error.message,
      // Include more debug info
      debug: {
        responseKeys: error.response?.data ? Object.keys(error.response.data) : 'No response data'
      }
    });
  }
});

// 2. Get Game Lobby
Gamesroute.get("/games/lobby", async (req, res) => {
  try {
    const { game_uuid, currency, technology } = req.query;

    if (!game_uuid || !currency) {
      return res.status(400).json({
        success: false,
        message: "game_uuid and currency are required"
      });
    }

    const headers = {
      'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      'X-Timestamp': Math.floor(Date.now() / 1000),
      'X-Nonce': crypto.randomBytes(16).toString('hex')
    };

    const params = { game_uuid, currency, technology };
    const xSign = calculateXSign({ ...params, ...headers }, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const response = await axios.get(`${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/games/lobby`, {
      params,
      headers: { ...headers, 'X-Sign': xSign }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch game lobby",
      error: error.response?.data || error.message
    });
  }
});
// ----------------- Callback Endpoints -----------------
function validateSessionConsistency(session_id, game_uuid, player_id, action = 'unknown') {
  if (!session_id) return true; // No session, no validation needed

  const sessionData = activeSessions.get(session_id);

  if (!sessionData) {
    // Session doesn't exist, create it
    activeSessions.set(session_id, {
      game_uuid,
      player_id,
      createdAt: Date.now(),
      createdFrom: action === 'callback' ? 'callback' : 'init'
    });
    return true;
  }

  // Check if game UUID matches
  if (sessionData.game_uuid !== game_uuid) {
    console.error("Game UUID change detected:", {
      session_id,
      expected_game_uuid: sessionData.game_uuid,
      received_game_uuid: game_uuid,
      player_id,
      action
    });
    return false;
  }

  // Check if player ID matches
  if (sessionData.player_id !== player_id) {
    console.error("Player ID change detected in session:", {
      session_id,
      expected_player_id: sessionData.player_id,
      received_player_id: player_id,
      game_uuid,
      action
    });
    return false;
  }

  return true;
}
// 3. Initialize Game Session
Gamesroute.post("/games/init", async (req, res) => {
  try {
    const {
      game_uuid,
      player_id,
      player_name,
      currency,
      session_id,
      device = "desktop",
      return_url,
      language,
      email,
    } = req.body;

    console.log("Game init request received:", {
      game_uuid,
      player_id,
      player_name,
      currency,
      session_id,
      device,
      return_url,
      language,
      email
    });

    if (!game_uuid || !player_id || !player_name || !currency || !session_id) {
      return res.status(400).json({
        success: false,
        message: "Required fields: game_uuid, player_id, player_name, currency, session_id"
      });
    }

    // Check if user exists and has balance
    const user = await UserModel.findOne({ player_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("User balance:", {
      player_id,
      balance: user.balance
    });

    // Validate session consistency - CRITICAL FIX
    const existingSession = activeSessions.get(session_id);
    if (existingSession) {
      if (existingSession.game_uuid !== game_uuid) {
        console.error("Session violation detected:", {
          session_id,
          existing_game_uuid: existingSession.game_uuid,
          requested_game_uuid: game_uuid,
          player_id
        });

        return res.status(400).json({
          success: false,
          message: "Game UUID cannot be changed within the same session",
          error_code: "SESSION_VIOLATION"
        });
      }

      if (existingSession.player_id !== player_id) {
        console.error("Player ID change detected in session:", {
          session_id,
          existing_player_id: existingSession.player_id,
          requested_player_id: player_id,
          game_uuid
        });

        return res.status(400).json({
          success: false,
          message: "Player ID cannot be changed within the same session",
          error_code: "SESSION_VIOLATION"
        });
      }

      // Update session timestamp if it already exists
      existingSession.createdAt = Date.now();
    } else {
      // Create new session
      activeSessions.set(session_id, {
        game_uuid,
        player_id,
        createdAt: Date.now(),
        initial_balance: user.balance,
        validated: false,
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomBytes(16).toString('hex');

    const headers = {
      'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      'X-Timestamp': timestamp,
      'X-Nonce': nonce
    };

    const signatureParams = {
      game_uuid,
      player_id,
      player_name,
      currency,
      session_id,
      device,
      return_url,
      language,
      email,
      'X-Merchant-Id': headers['X-Merchant-Id'],
      'X-Timestamp': headers['X-Timestamp'],
      'X-Nonce': headers['X-Nonce']
    };

    const xSign = calculateXSign(signatureParams, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const formData = new URLSearchParams();
    const bodyParams = {
      game_uuid,
      player_id,
      player_name,
      currency,
      session_id,
      device,
      return_url,
      language,
      email
    };

    Object.keys(bodyParams).forEach(key => {
      if (bodyParams[key] !== undefined && bodyParams[key] !== null) {
        formData.append(key, bodyParams[key]);
      }
    });

    console.log("Sending game init request to aggregator:", {
      url: `${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/games/init`,
      headers: {
        ...headers,
        'X-Sign': xSign,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: Object.fromEntries(formData)
    });

    const response = await axios.post(
      `${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/games/init`,
      formData.toString(),
      {
        headers: {
          ...headers,
          'X-Sign': xSign,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );

    console.log("Game init response received:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Game init error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      res.status(500).json({
        success: false,
        message: "No response from game server",
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to setup request",
        error: error.message
      });
    }
  }
});
Gamesroute.post("/games/init-demo", async (req, res) => {
  try {
    const { game_uuid, device = "desktop", return_url, language } = req.body;

    console.log("Request body:", req.body);

    if (!game_uuid) {
      console.log("Missing required parameter: game_uuid");
      return res.status(400).json({
        success: false,
        message: "game_uuid is required"
      });
    }

    // Prepare headers
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      'X-Timestamp': Math.floor(Date.now() / 1000),
      'X-Nonce': crypto.randomBytes(16).toString('hex')
    };

    // Prepare parameters for signature calculation
    const params = {
      game_uuid,
      device,
      return_url,
      language,
      'X-Merchant-Id': headers['X-Merchant-Id'],
      'X-Timestamp': headers['X-Timestamp'],
      'X-Nonce': headers['X-Nonce']
    };

    // Log all the parameters being used for the signature
    console.log("Parameters for signature calculation:", params);

    // Generate X-Sign - include headers and body parameters
    const xSign = calculateXSign(params, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);
    
    console.log("Generated X-Sign:", xSign);

    // Convert parameters to x-www-form-urlencoded format
    const urlEncodedParams = new URLSearchParams(params).toString();

    // Sending POST request to the demo game initialization API
    const response = await axios.post(
      `${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/games/init-demo`,
      urlEncodedParams,  // Send the parameters as x-www-form-urlencoded
      {
        headers: {
          ...headers,
          'X-Sign': xSign
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error initializing demo game:", error.message);  // Log only the error message

    // Send only the error message in the response, not the full error details
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message  // Send only the error message
    });
  }
});

// ----------------- Callback Handler -----------------

/**
 * Helper function to round a number to a specified number of decimal places.
 * This is crucial for handling floating-point arithmetic with monetary values
 * to avoid precision issues.
 * @param {number} num The number to round.
 * @param {number} places The number of decimal places to round to.
 * @returns {number} The rounded number.
 */
const roundToDecimals = (num, places) => {
  if (typeof num !== 'number') return 0;
  const multiplier = Math.pow(10, places);
  return Math.round(num * multiplier) / multiplier;
};

// A Map to store locks for each player to prevent concurrent balance updates.
const playerLocks = new Map();

Gamesroute.post("/self-validate", async (req, res) => {
  let user = null;

  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "Session ID (session_id) is required. Obtain it from a /games/init call."
      });
    }

    if (!GAME_AGGREGATOR_CONFIG.MERCHANT_ID || !GAME_AGGREGATOR_CONFIG.MERCHANT_KEY || !GAME_AGGREGATOR_CONFIG.BASE_API_URL) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Missing game aggregator credentials"
      });
    }

    // --- Start: Capture and store the user's original balance ---
    const sessionData = activeSessions.get(session_id);
    if (!sessionData || !sessionData.player_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired session ID."
      });
    }
    const playerId = sessionData.player_id;
    user = await UserModel.findOne({ player_id: playerId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Player not found."
      });
    }
    const originalBalance = user.balance;
    // --- End: Capture and store the user's original balance ---

    const requestParams = { session_id };
    const headers = {
      'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      'X-Timestamp': Math.floor(Date.now() / 1000),
      'X-Nonce': crypto.randomBytes(16).toString('hex')
    };

    const allParams = { ...requestParams, ...headers };
    const xSign = calculateXSign(allParams, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const apiUrl = `${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/self-validate`;

    const response = await axios.post(
      apiUrl,
      new URLSearchParams(requestParams).toString(),
      {
        headers: {
          ...headers,
          'X-Sign': xSign,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 60000
      }
    );

    if (sessionData) {
      sessionData.validated = true;
      sessionData.originalBalance = originalBalance;
      sessionData.updateBalanceYet = false;
    }

    res.json(response.data);

  } catch (error) {
    let errorMessage = "Failed to perform self-validation";
    let statusCode = 500;

    if (error.code === 'ECONNREFUSED') {
      errorMessage = "Cannot connect to Game Aggregator API - server may be down";
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = "Connection to Game Aggregator API timed out after 1 minute - please try again";
    } else if (error.message.includes('socket hang up')) {
      errorMessage = "Network connection failed - check firewall and SSL configuration";
    } else if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = `Game Aggregator API returned error: ${error.response.status} ${error.response.statusText}`;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.response?.data || error.message
    });
  }
});


async function handleGameCallback(req, res, expectedAction) {
  let transactionLockKey = null;
  let user = null;
  let balanceBefore = 0;
  let player_id = null;
  // ------------------my-change-------------------
  let gameSession = null;
  // ------------------my-change-------------------
  try {
    const {
      action,
      amount,
      currency = "EUR",
      game_uuid,
      player_id: body_player_id,
      transaction_id,
      session_id,
      round_id,
      bet_transaction_id,
      rollback_transactions
    } = req.body;

    player_id = body_player_id;

    while (playerLocks.has(player_id)) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    playerLocks.set(player_id, true);

    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    if (req.body.action === "balance") {
      console.log("Balance request routed to wrong endpoint, redirecting to balance handler");
      return await handleBalanceCallback(req, res);
    }

    console.log(`${action.toUpperCase()} callback received:`, {
      transaction_id,
      player_id,
      amount,
      currency,
      game_uuid,
      session_id,
      round_id,
      bet_transaction_id,
      rollback_transactions,
    });

    if (session_id) {
      const sessionData = activeSessions.get(session_id);
      console.log(sessionData, game_uuid)
      if (!sessionData) {
        return res.status(200).json({
          error_code: "INTERNAL_ERROR",
          error_description: "Session validation failed - callback does not match active session",
        });
      }
    }

    if (!player_id || !transaction_id) {
      return res.status(200).json({
        error_code: "INTERNAL_ERROR",
        error_description: "player_id and transaction_id are required",
      });
    }

    const ACTIONS_WITHOUT_AMOUNT = ["rollback", "balance"];

    if (!ACTIONS_WITHOUT_AMOUNT.includes(action) && amount === undefined) {
      return res.status(200).json({
        error_code: "INTERNAL_ERROR",
        error_description: "amount is required for this action",
      });
    }

    transactionLockKey = `${player_id}_${transaction_id}_${action}`;

    if (processedTransactions.has(transactionLockKey)) {
      user = await UserModel.findOne({ player_id });
      if (!user) {
        return res.status(200).json({
          error_code: "INTERNAL_ERROR",
          error_description: "Player not found",
        });
      }
      return res.status(200).json({
        balance: roundToDecimals(user.balance, 4),
        transaction_id: transactionLockKey,
      });
    }

    user = await UserModel.findOne({ player_id });
    if (!user) {
      return res.status(200).json({
        error_code: "INTERNAL_ERROR",
        error_description: "Player not found",
      });
    }

    const existingTransaction = user.transactionHistory.find(
      (t) => t.referenceId === transaction_id && t.type === action
    );
    if (existingTransaction) {
      transactionLockKey = `${player_id}_${transaction_id}_${action}`;
      return res.status(200).json({
        balance: roundToDecimals(user.balance, 4),
        transaction_id: transactionLockKey,
      });
    }

    processedTransactions.set(transactionLockKey, Date.now());

    balanceBefore = roundToDecimals(user.balance, 4);
    let transactionDescription = "";
    const amountValue = roundToDecimals(parseFloat(amount) || 0, 4);

    switch (action) {
      case "bet":
        if (user.balance < amountValue) {
          console.log("INSUFFICIENT_FUNDS INSUFFICIENT_FUNDS INSUFFICIENT_FUNDS", user.balance, amountValue)
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INSUFFICIENT_FUNDS",
            error_description: "Insufficient balance for this bet",
          });
        }
        
        user.balance = roundToDecimals(user.balance - amountValue, 4);
        transactionDescription = `Bet placed on game ${game_uuid}`;
          const game = await GameModel.findOne({ gameId: game_uuid });
  const isSlotGame = game && game.categories && game.categories.includes("স্লট গেম");
  
  // Only update bet totals if it's a slot game
const hasActiveFirstDeposit = user.bonusActivityLogs?.some(log => 
  log.bonusType === 'first_deposit' && 
  (log.status === 'success')
);

const hasCompletedSpecialBonus = user.bonusActivityLogs?.some(log => 
  log.bonusType === 'special_bonus' && 
  log.status === 'completed'
);

const hasActiveSpecialBonus = user.bonusActivityLogs?.some(log => 
  log.bonusType === 'special_bonus' && 
  log.status === 'active'
);

// Update total_bet based on bonus rules
// Update total_bet based on wagering game categories
const wageringCategories = user.waigergamecategory || [];

// Determine game category
const gameCategory = game?.categories?.[0]; // Get the first category or adjust as per your structure

if (wageringCategories.length === 0) {
  // If waigergamecategory is empty: ALL games count
  user.total_bet += amountValue;
  console.log(`No category restrictions - counting bet (${gameCategory || 'unknown'}):`, amountValue);
} else {
  // Check if game category is in wageringCategories array
  if (gameCategory && wageringCategories.includes(gameCategory)) {
    user.total_bet += amountValue;
    console.log(`Game category "${gameCategory}" matches wagering categories - counting bet:`, amountValue);
  } else {
    console.log(`Game category "${gameCategory}" does not match wagering categories - NOT counting bet`);
  }
}

  // ========== UPDATE WEEKLY AND MONTHLY BET TOTALS ==========
  // Update total bet amounts for weekly and monthly bonus calculations
  user.lifetime_bet += amountValue;
  user.weeklybetamount += amountValue;
  user.monthlybetamount+=amountValue;
  // Update weekly bet total
  const now = new Date();
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - now.getDay()); // Set to last Sunday
  lastSunday.setHours(0, 0, 0, 0);

  // Check if we're in a new week and reset if needed
  if (!user.weeklyBonus.lastClaimed || user.weeklyBonus.lastClaimed < lastSunday) {
    user.weeklyBonus.totalBet = 0;
    user.weeklyBonus.bonusAmount = 0;
    user.weeklyBonus.status = 'expired';
  }

  // Add to weekly bet total
  user.weeklyBonus.totalBet += amountValue;

  // Update monthly bet total
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Check if we're in a new month and reset if needed
  if (!user.monthlyBonus.lastClaimed || user.monthlyBonus.lastClaimed < firstDayOfMonth) {
    user.monthlyBonus.totalBet = 0;
    user.monthlyBonus.bonusAmount = 0;
    user.monthlyBonus.status = 'expired';
  }

  // Add to monthly bet total
  user.monthlyBonus.totalBet += amountValue;

  // ========== UPDATE LEVEL INFORMATION ==========
  // Check for level up after updating lifetime_bet
  const levelUpResult = user.checkLevelUp();
  if (levelUpResult.leveledUp) {
    console.log(`User leveled up from ${levelUpResult.fromLevel} to ${levelUpResult.toLevel}`);
    // Optionally log or notify about the level up
    // No need to manually update levelInfo here as checkLevelUp already updates it
  }

  // Update wagering requirements for active bonuses
  await user.applyBetToWagering(amountValue);
        break;
      case "win":
        if (amountValue < 0) {
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INTERNAL_ERROR",
            error_description: "Win amount cannot be negative",
          });
        }
        user.balance = roundToDecimals(user.balance + amountValue, 4);
        transactionDescription = `Win from game ${game_uuid}`;
        break;

      case "refund":
        if (!bet_transaction_id) {
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INTERNAL_ERROR",
            error_description: "bet_transaction_id is required for refunds",
          });
        }

        const originalBet = await GameHistory.findOne({
          transaction_id: bet_transaction_id,
          type: "bet",
        });

        if (!originalBet) {
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            transaction_id: transaction_id,
            balance: roundToDecimals(balanceBefore, 4),
          });
        }

        const existingRefund = await GameHistory.findOne({
          round_id: round_id,
          type: action,
          game_uuid: game_uuid
        });

        if (existingRefund) {
          transactionLockKey = `${player_id}_${existingRefund.transaction_id}_${action}`;
          return res.status(200).json({
            balance: roundToDecimals(user.balance, 4),
            transaction_id: transactionLockKey,
          });
        }

        const originalBetAmount = roundToDecimals(parseFloat(originalBet.amount), 4);
        if (amountValue > originalBetAmount) {
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INTERNAL_ERROR",
            error_description: `Refund amount ${amountValue} exceeds original bet ${originalBetAmount}`,
          });
        }

        user.balance = roundToDecimals(user.balance + amountValue, 4);
        transactionDescription = `Refund for bet ${bet_transaction_id}`;
        break;

      case "rollback":
        if (!rollback_transactions || !Array.isArray(rollback_transactions)) {
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INTERNAL_ERROR",
            error_description: "rollback_transactions is required and must be an array"
          });
        }

        let rollbackDesc = [];

        for (const tx of rollback_transactions) {
          const { action, transaction_id, amount } = tx;

          let gameHistory = await GameHistory.findOne({
            transaction_id: transaction_id,
            type: action,
          });

          if (!gameHistory) {
            console.warn(`Rollback target not found: ${transaction_id} (${action})`);
            continue;
          }

          switch (action) {
            case "bet":
              if (gameHistory.status === "completed") {
                user.balance = roundToDecimals(user.balance + parseFloat(amount), 4);
                gameHistory.status = "rolledback";
                rollbackDesc.push(transaction_id);
              } else if (gameHistory.status === "rolledback") {
                gameHistory.status = "completed";
                rollbackDesc.push(transaction_id);
              }
              await gameHistory.save();
              break;

            case "win":
              if (gameHistory.status === "completed") {
                user.balance = roundToDecimals(user.balance - parseFloat(amount), 4);
                gameHistory.status = "rolledback";
                rollbackDesc.push(transaction_id);
              } else if (gameHistory.status === "rolledback") {
                gameHistory.status = "completed";
                rollbackDesc.push(transaction_id);
              }
              await gameHistory.save();
              break;

            default:
              console.warn(`Unsupported rollback action: ${action}`);
              rollbackDesc.push(
                `Skipped unsupported rollback action: ${action} (${transaction_id})`
              );
              break;
          }
        }

        transactionDescription = `Rollback round ${round_id}: ${rollbackDesc.join("; ")}`;

        if (user.balance < 0) {
          user.balance = roundToDecimals(balanceBefore, 4);
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INSUFFICIENT_FUNDS",
            error_description: "Transaction would result in negative balance",
          });
        }

        await user.save();

        console.log(`Successfully processed ${action} transaction ${transaction_id}. Balance: ${balanceBefore} -> ${roundToDecimals(user.balance, 4)}`);

        res.status(200).json({
          balance: roundToDecimals(user.balance, 4),
          transaction_id: transactionLockKey,
          rollback_transactions: rollbackDesc,
        });

        break;

      default:
        processedTransactions.delete(transactionLockKey);
        return res.status(200).json({
          error_code: "INTERNAL_ERROR",
          error_description: `Unsupported action: ${action}`,
        });
    }

    if (user.balance < 0) {
      user.balance = roundToDecimals(balanceBefore, 4);
      processedTransactions.delete(transactionLockKey);
      return res.status(200).json({
        error_code: "INSUFFICIENT_FUNDS",
        error_description: "Transaction would result in negative balance",
      });
    }
 // Find or create game session
    gameSession = await GameSession.findOne({ session_id, is_active: true });
    
    if (!gameSession) {
      // Create new session if it doesn't exist
      const user = await UserModel.findOne({ player_id });
      if (!user) {
        return res.status(200).json({
          error_code: "INTERNAL_ERROR",
          error_description: "Player not found",
        });
      }
      const matched_game=await GameModel.findOne({gameId:game_uuid});
      gameSession = new GameSession({
        session_id,
        player_id,
        game_uuid,
        currency,
        game_name:matched_game.gameName,
        initial_balance: user.balance,
        current_balance: user.balance,
        transactions: []
      });
    }

     // Add transaction to session
    gameSession.addTransaction({
      transaction_id,
      type: action,
      amount: amountValue,
      currency,
      round_id,
      bet_transaction_id,
      status: 'completed'
    }); 
    user.transactionHistory.push({
      type: action,
      amount: roundToDecimals(Math.abs(amountValue), 4),
      balanceBefore,
      balanceAfter: roundToDecimals(user.balance, 4),
      description: transactionDescription,
      referenceId: transaction_id,
      game_uuid,
      round_id,
      session_id,
      bet_reference_id: bet_transaction_id,
      timestamp: new Date(),
      status: "completed",
    });
    await user.save();
    gameSession.save()
    await GameHistory.create({
      player_id,
      transaction_id,
      type: action,
      action,
      amount: amountValue,
      currency,
      game_uuid,
      session_id,
      round_id: round_id || `system_${Date.now()}_${transaction_id.substr(0, 8)}`,
      status: "completed",
      balance_before: balanceBefore,
      balance_after: roundToDecimals(user.balance, 4),
      merchant_id: GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      nonce: req.headers["x-nonce"] || req.headers["X-Nonce"],
      signature: req.headers["x-sign"] || req.headers["X-Sign"],
      provider_timestamp: req.headers["x-timestamp"] || req.headers["X-Timestamp"],
      created_at: new Date(),
    });

    console.log(`Successfully processed ${action} transaction ${transaction_id}. Balance: ${balanceBefore} -> ${roundToDecimals(user.balance, 4)}`);

    res.status(200).json({
      balance: roundToDecimals(user.balance, 4),
      transaction_id: transactionLockKey
    });
  } catch (error) {
    console.error(`${expectedAction} callback error:`, error);
    if (player_id) {
      playerLocks.delete(player_id);
    }

    if (transactionLockKey) {
      processedTransactions.delete(transactionLockKey);
    }
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error",
    });
  } finally {
    if (player_id) {
      playerLocks.delete(player_id);
    }
  }
}
async function handleBalanceCallback(req, res) {
  try {
    console.log("Balance callback received from Game Aggregator:", {
      body: req.body,
      headers: {
        'X-Merchant-Id': req.headers['x-merchant-id'],
        'X-Timestamp': req.headers['x-timestamp'],
        'X-Nonce': req.headers['x-nonce'],
        'X-Sign': req.headers['x-sign']
      }
    });

    const { action, player_id, currency, session_id } = req.body;

    if (!player_id || !currency) {
      return res.json({
        error_code: "INTERNAL_ERROR",
        error_description: "player_id and currency are required"
      });
    }

    const user = await UserModel.findOne({ player_id });

    if (!user) {
      console.log("Player not found:", player_id);
      return res.json({
        error_code: "INTERNAL_ERROR",
        error_description: "Player not found"
      });
    }

    console.log(activeSessions)

    const sessionData = activeSessions.get(session_id);

    if (sessionData.updateBalanceYet == false) {
      sessionData.updateBalanceYet = true;
      user.balance = sessionData.initial_balance;
      await user.save();
    }

    console.log("Returning balance for player:", {
      player_id,
      balance: user.balance,
      requested_currency: currency
    });

    console.log("user user user", user.balance)

    res.json({
      balance: user.balance
    });

  } catch (error) {
    console.error("Balance callback error:", error);
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
}

// Unified callback handler that accepts all action types
Gamesroute.post("/callback/game", async (req, res) => {
  try {
    console.log("Game callback received:", {
      body: req.body,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    // Validate signature first
    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const { action } = req.body;

    // Route to appropriate handler based on action
    switch (action) {
      case 'bet':
        return await handleGameCallback(req, res, 'bet');
      case 'win':
        return await handleGameCallback(req, res, 'win');
      case 'refund':
        return await handleGameCallback(req, res, 'refund');
      case 'balance':
        return await handleBalanceCallback(req, res);
      case 'rollback':
        return await handleRollbackCallback(req, res);
      default:
        console.log(`Unknown action received: ${action}`);
        return res.status(200).json({
          error_code: "INVALID_ACTION",
          error_description: `Unknown action: ${action}`
        });
    }
  } catch (error) {
    console.error("Game callback error:", error.message);

    if (error.message === 'Invalid signature' || error.message.includes('Missing required authentication headers')) {
      return res.status(200).json({
        error_code: "INTERNAL_ERROR",
        error_description: "Internal server error"
      });
    }

    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
});

// Keep legacy endpoints for backward compatibility
Gamesroute.post("/callback/bet", async (req, res) => {
  console.log("Legacy bet callback received:", req.body);
  try {
    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);
    await handleGameCallback(req, res, req.body.action || 'bet');
  } catch (error) {
    console.error("Bet callback error:", error.message);
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
});

Gamesroute.post("/callback/win", async (req, res) => {
  console.log("Legacy win callback received:", req.body);
  try {
    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);
    await handleGameCallback(req, res, req.body.action || 'win');
  } catch (error) {
    console.error("Win callback error:", error.message);
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
});

Gamesroute.post("/callback/refund", async (req, res) => {
  console.log("Legacy refund callback received:", req.body);
  try {
    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);
    await handleGameCallback(req, res, req.body.action || 'refund');
  } catch (error) {
    console.error("Refund callback error:", error.message);
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
});

// Dedicated balance callback endpoint
Gamesroute.post("/callback/balance", async (req, res) => {
  console.log("Balance callback received at dedicated endpoint:", req.body);
  await handleBalanceCallback(req, res);
});

// Rollback callback handler
async function handleRollbackCallback(req, res) {
  try {
    console.log("Rollback callback received:", {
      body: req.body,
      headers: req.headers
    });

    const headers = validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const {
      action,
      currency,
      game_uuid,
      player_id,
      transaction_id,
      rollback_transactions,
      session_id,
      provider_round_id,
      round_id,
      transaction_datetime,
      casino_request_retry_count
    } = req.body;

    const user = await UserModel.findOne({ player_id });
    if (!user) {
      return res.json({
        error_code: "INTERNAL_ERROR",
        error_description: "Player not found"
      });
    }

    const existingRollback = user.transactionHistory.find(
      t => t.referenceId === transaction_id && t.type === 'rollback'
    );

    if (existingRollback) {
      return res.json({
        balance: user.balance,
        transaction_id: existingRollback._id.toString(),
        rollback_transactions: rollback_transactions.map(t => t.transaction_id)
      });
    }

    const processedTransactions = [];
    let balanceChange = 0;

    for (const tx of rollback_transactions) {
      const existingTx = user.transactionHistory.find(
        t => t.referenceId === tx.transaction_id && t.type === tx.action
      );

      if (existingTx) {
        const txAmount = parseFloat(tx.amount) || 0;

        if (tx.action === 'bet') {
          balanceChange += txAmount;
        } else if (tx.action === 'win') {
          balanceChange -= txAmount;
        } else if (tx.action === 'refund') {
          balanceChange -= txAmount;
        }
        processedTransactions.push(tx.transaction_id);
      }
    }

    const balanceBefore = user.balance;
    user.balance += balanceChange;

    // CRITICAL FIX: Prevent negative balance in rollback
    if (user.balance < 0) {
      user.balance = balanceBefore;
      return res.json({
        error_code: "INSUFFICIENT_FUNDS",
        error_description: "Rollback would result in negative balance"
      });
    }

    // user.transactionHistory.push({
    //   type: 'rollback',
    //   amount: Math.abs(balanceChange),
    //   balanceBefore: balanceBefore,
    //   balanceAfter: user.balance,
    //   description: `Game rollback for transactions: ${processedTransactions.join(', ')}`,
    //   referenceId: transaction_id,
    //   timestamp: new Date()
    // });

    await user.save();

    res.json({
      balance: user.balance,
      transaction_id: transaction_id,
      rollback_transactions: processedTransactions
    });

  } catch (error) {
    console.error("Rollback callback error:", error);

    if (error.message === 'Invalid signature' || error.message === 'Missing required authentication headers') {
      return res.status(200).json({
        error_code: "INTERNAL_ERROR",
        error_description: "Internal server error"
      });
    }

    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
}

// Rollback Callback
Gamesroute.post("/callback/rollback", async (req, res) => {
  console.log("Rollback callback received:", req.body);
  try {
    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);
    await handleRollbackCallback(req, res);
  } catch (error) {
    console.error("Rollback callback error:", error.message);
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
});

// Self Validation
Gamesroute.post("/self-validate", async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "Session ID (session_id) is required. Obtain it from a /games/init call."
      });
    }

    if (!GAME_AGGREGATOR_CONFIG.MERCHANT_ID || !GAME_AGGREGATOR_CONFIG.MERCHANT_KEY || !GAME_AGGREGATOR_CONFIG.BASE_API_URL) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Missing game aggregator credentials"
      });
    }

    const requestParams = { session_id };
    const headers = {
      'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      'X-Timestamp': Math.floor(Date.now() / 1000),
      'X-Nonce': crypto.randomBytes(16).toString('hex')
    };

    const allParams = { ...requestParams, ...headers };
    const xSign = calculateXSign(allParams, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const apiUrl = `${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/self-validate`;

    const response = await axios.post(
      apiUrl,
      new URLSearchParams(requestParams).toString(),
      {
        headers: {
          ...headers,
          'X-Sign': xSign,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 60000
      }
    );

    res.json(response.data);

  } catch (error) {
    let errorMessage = "Failed to perform self-validation";
    let statusCode = 500;
    if (error.code === 'ECONNREFUSED') {
      errorMessage = "Cannot connect to Game Aggregator API - server may be down";
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = "Connection to Game Aggregator API timed out after 1 minute - please try again";
    } else if (error.message.includes('socket hang up')) {
      errorMessage = "Network connection failed - check firewall and SSL configuration";
    } else if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = `Game Aggregator API returned error: ${error.response.status} ${error.response.statusText}`;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.response?.data || error.message
    });
  }
});

module.exports = Gamesroute;
