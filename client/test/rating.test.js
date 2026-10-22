import { describe, expect, it } from 'vitest';
import { ratingFor } from '../src/reportData.js';

const counts = (critical, serious, moderate, minor) => ({ critical, serious, moderate, minor });

describe('provisional Bronze / Silver / Gold rating', () => {
  it('is Gold with no issues at all', () => {
    expect(ratingFor(counts(0, 0, 0, 0))).toEqual({ level: 'gold', next: null });
  });

  it('is Silver with only moderate and minor issues', () => {
    expect(ratingFor(counts(0, 0, 2, 3))).toEqual({ level: 'silver', next: { level: 'gold', issues: 5 } });
  });

  it('is Bronze with serious but no critical issues', () => {
    expect(ratingFor(counts(0, 4, 1, 0))).toEqual({ level: 'bronze', next: { level: 'silver', issues: 4, impact: 'serious' } });
  });

  it('is not rated while any critical issue remains', () => {
    expect(ratingFor(counts(1, 0, 0, 0))).toEqual({ level: 'none', next: { level: 'bronze', issues: 1, impact: 'critical' } });
  });
});
