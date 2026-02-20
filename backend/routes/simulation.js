/**
 * NPS IntelliPension AI — Simulation Routes
 */

const express = require("express");
const router = express.Router();
const { simulateCorpus, optimizeContribution } = require("../services/pensionEngine");

/**
 * POST /api/simulation/corpus
 * Calculate retirement corpus
 */
router.post("/corpus", (req, res) => {
  try {
    const {
      monthlyContribution,
      currentAge,
      retirementAge,
      riskProfile,
      inflationAdjusted,
    } = req.body;

    if (!monthlyContribution || !currentAge) {
      return res.status(400).json({
        success: false,
        error: "monthlyContribution and currentAge are required",
      });
    }

    const result = simulateCorpus({
      monthlyContribution: Number(monthlyContribution),
      currentAge: Number(currentAge),
      retirementAge: Number(retirementAge) || 60,
      riskProfile: riskProfile || "moderate",
      inflationAdjusted: !!inflationAdjusted,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: "Simulation failed: " + err.message });
  }
});

/**
 * POST /api/simulation/optimize
 * Reverse-calculate required contribution for target corpus
 */
router.post("/optimize", (req, res) => {
  try {
    const { targetCorpus, currentAge, retirementAge, riskProfile } = req.body;

    if (!targetCorpus || !currentAge) {
      return res.status(400).json({
        success: false,
        error: "targetCorpus and currentAge are required",
      });
    }

    const result = optimizeContribution({
      targetCorpus: Number(targetCorpus),
      currentAge: Number(currentAge),
      retirementAge: Number(retirementAge) || 60,
      riskProfile: riskProfile || "moderate",
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: "Optimization failed: " + err.message });
  }
});

/**
 * POST /api/simulation/scenarios
 * Multi-scenario comparison
 */
router.post("/scenarios", (req, res) => {
  try {
    const { monthlyContribution, currentAge, retirementAge } = req.body;

    const scenarios = ["conservative", "moderate", "aggressive"].map((profile) => {
      const result = simulateCorpus({
        monthlyContribution: Number(monthlyContribution),
        currentAge: Number(currentAge),
        retirementAge: Number(retirementAge) || 60,
        riskProfile: profile,
      });
      return {
        profile,
        ...result.data?.corpus,
        monthlyPension: result.data?.withdrawal?.estimatedMonthlyPension,
      };
    });

    res.json({ success: true, data: { scenarios } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
