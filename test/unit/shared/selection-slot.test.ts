import { describe, it, expect } from 'vitest';
import { SELECTION_SLOTS, isSelectionSlot } from '@shared/domain/selection-slot';

describe('isSelectionSlot', () => {
  it.each(SELECTION_SLOTS)('accepts every catalogued slot value (%s)', (slot) => {
    expect(isSelectionSlot(slot)).toBe(true);
  });

  it('rejects a value not in the catalog', () => {
    expect(isSelectionSlot('overall_points')).toBe(false);
  });

  it('rejects a near-miss (wrong case/spelling)', () => {
    expect(isSelectionSlot('Top_1')).toBe(false);
    expect(isSelectionSlot('top1')).toBe(false);
  });
});
