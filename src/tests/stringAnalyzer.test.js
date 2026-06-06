// Mock database agar StringAnalyzerModel bisa di-load tanpa koneksi Supabase
jest.mock('../../config/database', () => ({
  transactions: {},
}));

const StringAnalyzerModel = require('../models/StringAnalyzerModel');

describe('StringAnalyzerModel.analyze()', () => {

  // ── Case Sensitive ────────────────────────────────────────────────────────

  describe('Case Sensitive', () => {
    test('contoh dari requirement: ABBCD vs Gallant Duck → 25%', () => {
      const result = StringAnalyzerModel.analyze('ABBCD', 'Gallant Duck', true);
      // Unique chars input1: A, B, C, D (4 unik)
      // Match: hanya D (ada di "Gallant Duck")
      expect(result.totalUnique).toBe(4);
      expect(result.matchedCount).toBe(1);
      expect(result.percentage).toBe(25);
    });

    test('semua karakter cocok → 100%', () => {
      const result = StringAnalyzerModel.analyze('abc', 'abcdef', true);
      expect(result.percentage).toBe(100);
      expect(result.matchedCount).toBe(3);
    });

    test('tidak ada karakter yang cocok → 0%', () => {
      const result = StringAnalyzerModel.analyze('xyz', 'abc', true);
      expect(result.percentage).toBe(0);
      expect(result.matchedCount).toBe(0);
    });

    test('karakter duplikat di input1 dihitung sebagai unik', () => {
      // "ABBCD" → unique: A, B, C, D (bukan A, B, B, C, D)
      const result = StringAnalyzerModel.analyze('ABBCD', 'Gallant Duck', true);
      expect(result.totalUnique).toBe(4);
    });

    test('huruf besar dan kecil dianggap berbeda', () => {
      // 'a' tidak cocok dengan 'A'
      const result = StringAnalyzerModel.analyze('a', 'A', true);
      expect(result.matchedCount).toBe(0);
      expect(result.percentage).toBe(0);
    });

    test('karakter spasi terdeteksi sebagai [space]', () => {
      const result = StringAnalyzerModel.analyze('a b', 'hello world', true);
      const matchedLabels = result.matchedChars.map(c => c.char);
      expect(matchedLabels).toContain('[space]');
    });
  });

  // ── Case Insensitive ──────────────────────────────────────────────────────

  describe('Case Insensitive', () => {
    test('contoh dari requirement: ABBCD vs Gallant Duck → 75%', () => {
      const result = StringAnalyzerModel.analyze('ABBCD', 'Gallant Duck', false);
      // Unique chars (lowercase): a, b, c, d (4 unik)
      // Match: a (ada), b (tidak), c (tidak ada), d (ada di duck) → a dan d
      // Sebenarnya: a=ada, b=tidak, c=tidak, d=ada di duck → 2? Mari cek:
      // "gallant duck" lowercase: g,a,l,l,a,n,t,' ',d,u,c,k
      // a → ada ✓, b → tidak ✗, c → ada (duck) ✓, d → ada (duck) ✓ → 3/4 = 75%
      expect(result.totalUnique).toBe(4);
      expect(result.matchedCount).toBe(3);
      expect(result.percentage).toBe(75);
    });

    test('huruf besar dan kecil dianggap sama', () => {
      const result = StringAnalyzerModel.analyze('A', 'apple', false);
      expect(result.matchedCount).toBe(1);
      expect(result.percentage).toBe(100);
    });

    test('semua unique chars tidak cocok → 0%', () => {
      const result = StringAnalyzerModel.analyze('xyz', 'abc', false);
      expect(result.percentage).toBe(0);
    });
  });

  // ── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    test('input1 kosong → percentage 0', () => {
      const result = StringAnalyzerModel.analyze('', 'hello', true);
      expect(result.percentage).toBe(0);
      expect(result.totalUnique).toBe(0);
    });

    test('input2 kosong → tidak ada yang cocok', () => {
      const result = StringAnalyzerModel.analyze('abc', '', true);
      expect(result.matchedCount).toBe(0);
      expect(result.percentage).toBe(0);
    });

    test('kedua input sama → 100%', () => {
      const result = StringAnalyzerModel.analyze('hello', 'hello', true);
      expect(result.percentage).toBe(100);
    });

    test('input1 satu karakter, cocok → 100%', () => {
      const result = StringAnalyzerModel.analyze('a', 'banana', true);
      expect(result.percentage).toBe(100);
    });

    test('input1 satu karakter, tidak cocok → 0%', () => {
      const result = StringAnalyzerModel.analyze('z', 'banana', true);
      expect(result.percentage).toBe(0);
    });

    test('hasil memiliki struktur yang benar', () => {
      const result = StringAnalyzerModel.analyze('abc', 'abcdef', true);
      expect(result).toHaveProperty('input1');
      expect(result).toHaveProperty('input2');
      expect(result).toHaveProperty('mode');
      expect(result).toHaveProperty('uniqueChars');
      expect(result).toHaveProperty('matchedChars');
      expect(result).toHaveProperty('unmatchedChars');
      expect(result).toHaveProperty('matchedCount');
      expect(result).toHaveProperty('totalUnique');
      expect(result).toHaveProperty('percentage');
      expect(result).toHaveProperty('summary');
    });

    test('field mode sesuai dengan parameter caseSensitive', () => {
      const sensitive = StringAnalyzerModel.analyze('a', 'a', true);
      const insensitive = StringAnalyzerModel.analyze('a', 'a', false);
      expect(sensitive.mode).toBe('Case Sensitive');
      expect(insensitive.mode).toBe('Case Insensitive');
    });

    test('summary menampilkan format yang benar', () => {
      const result = StringAnalyzerModel.analyze('abc', 'abcdef', true);
      expect(result.summary).toMatch(/\d+ \/ \d+ unique characters found → \d+(\.\d+)?%/);
    });
  });
});
