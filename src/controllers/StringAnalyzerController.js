/**
 * StringAnalyzerController
 * Handles the character matching feature from the technical test requirements
 */

const StringAnalyzerModel = require('../models/StringAnalyzerModel');

class StringAnalyzerController {
  // ── GET /analyzer ────────────────────────────────────────────────────────────
  async index(req, res) {
    try {
      const history = await StringAnalyzerModel.getHistory(10);
      res.render('analyzer/index', {
        title: 'String Analyzer',
        result: null,
        formData: {},
        history,
      });
    } catch (err) {
      res.render('error', { title: 'Error', message: err.message });
    }
  }

  // ── POST /analyzer ───────────────────────────────────────────────────────────
  async analyze(req, res) {
    try {
      const { input1, input2, mode } = req.body;

      if (!input1 || !input2) {
        req.flash('error', 'Both inputs are required.');
        return res.redirect('/analyzer');
      }

      const caseSensitive = mode !== 'insensitive';
      const result = StringAnalyzerModel.analyze(input1, input2, caseSensitive);

      // Save to history
      const userId = req.session.user ? req.session.user._id : null;
      await StringAnalyzerModel.saveAnalysis(result, userId);

      const history = await StringAnalyzerModel.getHistory(10);

      res.render('analyzer/index', {
        title: 'String Analyzer',
        result,
        formData: { input1, input2, mode },
        history,
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/analyzer');
    }
  }
}

module.exports = new StringAnalyzerController();
