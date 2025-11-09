import AsyncStorage from '@react-native-async-storage/async-storage';

// Type for a saved item
/**
 * @typedef {Object} SavedItem
 * @property {string} id
 * @property {string} createdAt
 */

/**
 * Get all saved items from AsyncStorage
 * @returns {Promise<SavedItem[]>}
 */
export async function getSavedItems() {
  const raw = await AsyncStorage.getItem('saved_library');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save or unsave an item by id
 * @param {string} id
 * @param {boolean} save
 * @returns {Promise<void>}
 */
export async function setSavedItem(id, save) {
  const items = await getSavedItems();
  if (save) {
    if (!items.find(i => i.id === id)) {
      items.push({ id, createdAt: new Date().toISOString() });
    }
  } else {
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) items.splice(idx, 1);
  }
  await AsyncStorage.setItem('saved_library', JSON.stringify(items));
}

/**
 * Check if an item is saved
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function isSaved(id) {
  const items = await getSavedItems();
  return !!items.find(i => i.id === id);
}
