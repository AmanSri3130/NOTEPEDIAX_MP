import test from 'node:test';
import assert from 'node:assert/strict';
import { rankLeaderboardRows } from '../services/leaderboardService.js';

test('ranks only provided enrolled students by XP then watch time', () => {
  const students = [
    { _id: 'a', name: 'Asha', xp: 100 },
    { _id: 'b', name: 'Bharat', xp: 100 },
    { _id: 'c', name: 'Chitra', xp: 250 },
  ];
  const enrolled = new Map([['a', 1], ['b', 2], ['c', 1]]);
  const watchTimes = new Map([['a', 120], ['b', 600], ['c', 60]]);

  const result = rankLeaderboardRows(students, enrolled, watchTimes);

  assert.deepEqual(result.map(({ id, rank }) => [id, rank]), [['c', 1], ['b', 2], ['a', 3]]);
  assert.equal(result[1].watchTimeSeconds, 600);
  assert.equal(result[1].enrolledCourseCount, 2);
});

test('returns no invented students when MongoDB has no eligible enrollment records', () => {
  assert.deepEqual(rankLeaderboardRows([], new Map(), new Map()), []);
});

test('missing database XP and watch-time values are shown as real zero values', () => {
  const [student] = rankLeaderboardRows(
    [{ _id: 'student-id', name: 'Diya' }],
    new Map([['student-id', 1]]),
    new Map()
  );
  assert.equal(student.xp, 0);
  assert.equal(student.watchTimeSeconds, 0);
  assert.equal(student.enrolledCourseCount, 1);
});
