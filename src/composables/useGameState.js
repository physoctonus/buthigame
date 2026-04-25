// filepath: src/composables/useGameState.js
import { ref, computed, reactive } from 'vue';
import { getObservations, getObservationCount } from '../services/inaturalist';

/**
 * Composable for managing game state
 * Uses Vue 3 Composition API for better performance and organization
 */
export function useGameState() {
  // Game configuration
  const config = reactive({
    perPage: 10,
    maxRounds: 300
  });

  // Game state
  const gameState = reactive({
    score: 0,
    totalQuestions: 0,
    isStarted: false,
    isLoading: false,
    isDisabled: true,
    roundsExecuted: 0
  });

  // Current species info
  const currentSpecies = reactive({
    genus: 'Genus',
    species: 'species',
    subspecies: null
  });

  // Options state
  const options = reactive({
    anyOn: false,
    dateSwitchOn: false,
    userSwitchOn: false,
    orderSwitchOn: false,
    familySwitchOn: false
  });

  // Card data for the 4 options
  const cards = reactive([
    { id: 1, name: '', image: '', date: '', user: '', link: '', coords: [], win: false, lose: false, pageNum: 1 },
    { id: 2, name: '', image: '', date: '', user: '', link: '', coords: [], win: false, lose: false, pageNum: 1 },
    { id: 3, name: '', image: '', date: '', user: '', link: '', coords: [], win: false, lose: false, pageNum: 1 },
    { id: 4, name: '', image: '', date: '', user: '', link: '', coords: [], win: false, lose: false, pageNum: 1 }
  ]);

  // API response storage
  const apiResults = ref([]);
  const pageCount = ref(1);
  const isInvalid = ref(false);

  // Current taxon query
  const taxonQuery = ref('');

  // Computed properties
  const accuracy = computed(() => {
    if (gameState.totalQuestions === 0) return 0;
    return Math.round((gameState.score / gameState.totalQuestions) * 100);
  });

  const fullName = computed(() => {
    let name = `${currentSpecies.genus} ${currentSpecies.species}`;
    if (currentSpecies.subspecies) {
      name += ` ${currentSpecies.subspecies}`;
    }
    return name;
  });

  const isGameOver = computed(() => {
    return gameState.roundsExecuted >= config.maxRounds;
  });

  // Helper functions
  function getMedium(url) {
    if (!url) return '';
    return url.replace('/square.', '/medium.');
  }

  function randomPage() {
    return Math.floor(Math.random() * pageCount.value) + 1;
  }

  function getRandomPageNums() {
    cards.forEach(card => {
      card.pageNum = randomPage();
    });
  }

  // Core game methods
  async function fetchObservations() {
    if (!taxonQuery.value) return;
    
    gameState.isLoading = true;
    isInvalid.value = false;

    try {
      // Get page count first
      const countData = await getObservationCount(taxonQuery.value);
      
      if (countData < 10) {
        isInvalid.value = true;
        gameState.isLoading = false;
        return;
      }

      pageCount.value = Math.min(Math.ceil(countData / config.perPage), 1000);

      // Fetch 4 pages of observations in parallel
      const promises = cards.map(() => 
        getObservations({
          taxonId: taxonQuery.value,
          page: randomPage(),
          perPage: config.perPage
        })
      );

      apiResults.value = await Promise.all(promises);
      gameState.isLoading = false;
      gameState.isStarted = true;
    } catch (error) {
      console.error('Error fetching observations:', error);
      gameState.isLoading = false;
    }
  }

  function updateCards() {
    if (!apiResults.value.length) return;

    cards.forEach((card, index) => {
      const result = apiResults.value[index];
      const pageNum = card.pageNum;
      
      if (result?.results?.[pageNum]) {
        const obs = result.results[pageNum];
        
        card.name = obs.taxon?.name || '';
        card.image = getMedium(obs.photos?.[0]?.url || '');
        card.date = obs.observed_on || '';
        card.user = obs.user?.login || '';
        card.link = obs.uri || '';
        
        // Parse coordinates
        if (obs.location) {
          card.coords = obs.location.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        } else {
          card.coords = [];
        }
      }
    });

    // Apply order/family overrides
    if (options.orderSwitchOn) {
      cards.forEach((card, index) => {
        const result = apiResults.value[index];
        const obs = result?.results?.[cards[index].pageNum];
        if (obs) {
          const order = getOrderFromIdentifications(obs);
          card.name = order;
        }
      });
    }

    if (options.familySwitchOn) {
      cards.forEach((card, index) => {
        const result = apiResults.value[index];
        const obs = result?.results?.[cards[index].pageNum];
        if (obs) {
          const family = getFamilyFromIdentifications(obs);
          card.name = family;
        }
      });
    }

    // Set current species
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    const nameParts = randomCard.name.split(' ');
    currentSpecies.genus = nameParts[0] || 'Genus';
    currentSpecies.species = nameParts[1] || 'species';
    currentSpecies.subspecies = nameParts.length > 2 ? nameParts[2] : null;
  }

  function getOrderFromIdentifications(obs) {
    if (!obs?.identifications) return '';
    
    for (const ident of obs.identifications) {
      if (ident.category === 'supporting') {
        const order = ident.taxon?.ancestors?.find(a => a.rank === 'order');
        if (order) return order.name;
      }
    }
    return '';
  }

  function getFamilyFromIdentifications(obs) {
    if (!obs?.identifications) return '';
    
    for (const ident of obs.identifications) {
      if (ident.category === 'supporting') {
        const family = ident.taxon?.ancestors?.find(a => a.rank === 'family');
        if (family) return family.name;
      }
    }
    return '';
  }

  function checkForDuplicates() {
    const names = cards.map(c => c.name);
    const uniqueNames = new Set(names);
    return uniqueNames.size !== names.length;
  }

  function nextRound() {
    if (isGameOver.value) {
      return;
    }

    getRandomPageNums();
    updateCards();
    
    // Reset card states
    cards.forEach(card => {
      card.win = false;
      card.lose = false;
    });
    
    gameState.isDisabled = false;
    gameState.roundsExecuted++;
  }

  function selectCard(cardId) {
    if (gameState.isDisabled) return;
    
    gameState.isDisabled = true;
    const selectedCard = cards.find(c => c.id === cardId);
    
    if (selectedCard) {
      if (selectedCard.name === fullName.value) {
        selectedCard.win = true;
        gameState.score++;
      } else {
        selectedCard.lose = true;
      }
    }
    
    gameState.totalQuestions++;
  }

  function setTaxonQuery(query) {
    taxonQuery.value = query;
  }

  function resetGame() {
    gameState.score = 0;
    gameState.totalQuestions = 0;
    gameState.roundsExecuted = 0;
    gameState.isStarted = false;
    gameState.isDisabled = true;
    
    currentSpecies.genus = 'Genus';
    currentSpecies.species = 'species';
    currentSpecies.subspecies = null;
    
    cards.forEach(card => {
      card.win = false;
      card.lose = false;
    });
  }

  return {
    // State
    config,
    gameState,
    currentSpecies,
    options,
    cards,
    pageCount,
    isInvalid,
    taxonQuery,
    
    // Computed
    accuracy,
    fullName,
    isGameOver,
    
    // Methods
    fetchObservations,
    nextRound,
    selectCard,
    setTaxonQuery,
    resetGame,
    checkForDuplicates
  };
}

export default useGameState;