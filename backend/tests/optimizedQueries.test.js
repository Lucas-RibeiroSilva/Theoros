import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCardSummarySelect,
  buildFavoriteCardSelect,
  buildRatingSummarySelect,
} from '../src/utils/optimizedQueries.js';

test('buildCardSummarySelect returns only lightweight card fields', () => {
  const select = buildCardSummarySelect();

  assert.equal(select.id, true);
  assert.equal(select.name, true);
  assert.equal(select.image, true);
  assert.equal(select.history, true);
  assert.equal(select.ratingAverage, true);
  assert.equal(select.userId, true);
  assert.ok(select.race);
  assert.ok(select.user);
});

test('buildFavoriteCardSelect returns the needed card fields for profile lists', () => {
  const select = buildFavoriteCardSelect();

  assert.equal(select.id, true);
  assert.equal(select.name, true);
  assert.equal(select.image, true);
  assert.equal(select.history, true);
  assert.equal(select.ratingAverage, true);
  assert.ok(select.race);
});

test('buildRatingSummarySelect returns comment metadata for the card page', () => {
  const select = buildRatingSummarySelect();

  assert.equal(select.id, true);
  assert.equal(select.score, true);
  assert.equal(select.commentary, true);
  assert.equal(select.createdAt, true);
  assert.ok(select.user);
});
