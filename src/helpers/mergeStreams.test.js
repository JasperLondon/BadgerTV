import mergeStreams from './mergeStreams';

describe('mergeStreams', () => {
  it('returns next if prev is not array', () => {
    expect(mergeStreams(null, [{ id: 1 }])).toEqual([{ id: 1 }]);
  });
  it('returns [] if next is not array', () => {
    expect(mergeStreams([{ id: 1 }], null)).toEqual([]);
  });
  it('merges by id, updates fields, preserves order', () => {
    const prev = [
      { id: 'a', title: 'A', viewers: 1 },
      { id: 'b', title: 'B', viewers: 2 },
    ];
    const next = [
      { id: 'a', title: 'A+', viewers: 3 },
      { id: 'c', title: 'C', viewers: 4 },
    ];
    const merged = mergeStreams(prev, next);
    expect(merged).toEqual([
      { id: 'a', title: 'A+', viewers: 3 },
      // b is missing in next, so removed
      { id: 'c', title: 'C', viewers: 4 },
    ]);
  });
  it('adds new streams at end', () => {
    const prev = [{ id: 'a', title: 'A' }];
    const next = [
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' },
    ];
    const merged = mergeStreams(prev, next);
    expect(merged).toEqual([
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' },
    ]);
  });
  it('removes streams missing in next', () => {
    const prev = [
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' },
    ];
    const next = [{ id: 'a', title: 'A' }];
    const merged = mergeStreams(prev, next);
    expect(merged).toEqual([{ id: 'a', title: 'A' }]);
  });
  it('handles empty arrays', () => {
    expect(mergeStreams([], [])).toEqual([]);
  });
});
