import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SearchScreen from '../src/screens/SearchScreen';

// Mock navigation and context
const navigation = { navigate: jest.fn() };
jest.mock('../src/context/VideoContext', () => ({
  useVideos: () => ({
    videos: [
      { id: '1', title: 'Test Video', description: 'A test video', category: 'Demo', type: 'video', image: null },
      { id: '2', title: 'Showcase', description: 'Showcase video', category: 'Show', type: 'show', image: null },
    ],
  }),
}));

describe('SearchScreen', () => {
  it('renders without crashing', () => {
    const { getByPlaceholderText } = render(<SearchScreen navigation={navigation} />);
    expect(getByPlaceholderText('Search videos, shows, events...')).toBeTruthy();
  });

  it('shows results when searching', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<SearchScreen navigation={navigation} />);
    const input = getByPlaceholderText('Search videos, shows, events...');
    fireEvent.changeText(input, 'Test');
    await waitFor(() => expect(findByText('Test Video')).resolves.toBeTruthy());
  });

  it('shows no results for unknown query', async () => {
    const { getByPlaceholderText, findByText } = render(<SearchScreen navigation={navigation} />);
    const input = getByPlaceholderText('Search videos, shows, events...');
    fireEvent.changeText(input, 'Unknown');
    await waitFor(() => expect(findByText('No results found')).resolves.toBeTruthy());
  });
});
