/**
 * StringAnalyzerModel - Extends BaseModel
 *
 * OOP Concept: Inheritance - extends BaseModel to save analysis history to DB,
 * but also adds unique string-analysis logic as per the technical test requirement.
 *
 * Core Feature:
 *   Given two strings and a comparison mode (case-sensitive / case-insensitive),
 *   calculate what percentage of UNIQUE characters from input1 appear in input2.
 */

const BaseModel = require('./BaseModel');
const db = require('../../config/database');

class StringAnalyzerModel extends BaseModel {
  constructor() {
    super(db.transactions, 'StringAnalyzer');
  }

  // ─── Core Analysis Logic ─────────────────────────────────────────────────────

  /**
   * Analyze character overlap between two strings.
   *
   * Algorithm (as per test requirement):
   *   1. Get unique characters from input1 (deduplicated)
   *   2. For each unique char in input1, check if it appears in input2
   *   3. percentage = (matchedChars / uniqueCharsInInput1) * 100
   *
   * @param {string} input1
   * @param {string} input2
   * @param {boolean} caseSensitive
   * @returns {Object} detailed analysis result
   */
  analyze(input1, input2, caseSensitive = true) {
    // ── Prepare strings based on sensitivity mode ─────────────────────────────
    const str1 = caseSensitive ? input1 : input1.toLowerCase();
    const str2 = caseSensitive ? input2 : input2.toLowerCase();

    // ── Step 1: Get unique characters from input1 ─────────────────────────────
    // Using Set to deduplicate; then convert to array for iteration
    const uniqueChars = [...new Set(str1.split(''))];

    const matchedChars = [];
    const unmatchedChars = [];

    // ── Step 2: Nested loop - check each unique char against input2 ───────────
    for (const char of uniqueChars) {
      let found = false;

      // Inner loop: iterate through each character of input2
      for (let i = 0; i < str2.length; i++) {
        if (str2[i] === char) {
          found = true;
          break; // char found, no need to check further
        }
      }

      // Nested if: categorize the character
      if (found) {
        if (char === ' ') {
          matchedChars.push({ char: '[space]', original: char });
        } else {
          matchedChars.push({ char, original: char });
        }
      } else {
        if (char === ' ') {
          unmatchedChars.push({ char: '[space]', original: char });
        } else {
          unmatchedChars.push({ char, original: char });
        }
      }
    }

    // ── Step 3: Mathematics - calculate percentage ────────────────────────────
    const totalUnique = uniqueChars.length;
    const matchedCount = matchedChars.length;

    // Guard against division by zero
    const percentage = totalUnique > 0
      ? Math.round((matchedCount / totalUnique) * 100 * 100) / 100 // round to 2 decimals
      : 0;

    return {
      input1: { raw: input1, length: input1.length, uniqueCount: totalUnique },
      input2: { raw: input2, length: input2.length },
      mode: caseSensitive ? 'Case Sensitive' : 'Case Insensitive',
      uniqueChars: uniqueChars.map(c => (c === ' ' ? '[space]' : c)),
      matchedChars,
      unmatchedChars,
      matchedCount,
      totalUnique,
      percentage,
      summary: `${matchedCount} / ${totalUnique} unique characters found → ${percentage}%`,
    };
  }

  // ─── Persistence Methods ─────────────────────────────────────────────────────

  /**
   * Save an analysis result to DB (history)
   */
  async saveAnalysis(result, userId = null) {
    return await this.create({
      type: 'string_analysis',
      userId,
      input1: result.input1.raw,
      input2: result.input2.raw,
      mode: result.mode,
      percentage: result.percentage,
      summary: result.summary,
    });
  }

  /**
   * Get recent analysis history
   */
  async getHistory(limit = 10) {
    const all = await this.findAll({ type: 'string_analysis' });
    // Sort descending by createdAt, take last `limit`
    return all
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
}

module.exports = new StringAnalyzerModel();
