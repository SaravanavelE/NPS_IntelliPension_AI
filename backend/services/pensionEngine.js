/**
 * NPS IntelliPension AI — Backend Pension Engine Service
 * Node.js / Express Backend
 */

const RETURN_RATES = {
  conservative: { expectedReturn: 0.08, equity: 0.25, debt: 0.75 },
  moderate:     { expectedReturn: 0.10, equity: 0.50, debt: 0.50 },
  aggressive:   { expectedReturn: 0.12, equity: 0.75, debt: 0.25 },
};

const NPS_RULES = {
  annuityPurchaseMin: 0.40,
  annuityRate: 0.055,
  inflationRate: 0.06,
  minContribution: 500,
  maxJoinAge: 70,
  minJoinAge: 18,
};

/**
 * Main simulation function — returns structured JSON
 */
function simulateCorpus({
  monthlyContribution,
  currentAge,
  retirementAge = 60,
  riskProfile = "moderate",
  inflationAdjusted = false,
}) {
  // Input validation
  if (!monthlyContribution || monthlyContribution < NPS_RULES.minContribution) {
    return { success: false, error: `Minimum contribution is ₹${NPS_RULES.minContribution}/month` };
  }
  if (currentAge < NPS_RULES.minJoinAge || currentAge > NPS_RULES.maxJoinAge) {
    return { success: false, error: `Age must be between ${NPS_RULES.minJoinAge} and ${NPS_RULES.maxJoinAge}` };
  }
  if (retirementAge <= currentAge) {
    return { success: false, error: "Retirement age must be greater than current age" };
  }
  if (!RETURN_RATES[riskProfile]) {
    return { success: false, error: "Invalid risk profile. Choose: conservative, moderate, or aggressive" };
  }

  const profile = RETURN_RATES[riskProfile];
  const monthlyRate = profile.expectedReturn / 12;
  const years = retirementAge - currentAge;
  const months = years * 12;

  // SIP Future Value formula
  const totalCorpus =
    monthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  const totalContributed = monthlyContribution * months;
  const wealthGained = totalCorpus - totalContributed;

  // Annuity
  const annuityCorpus = totalCorpus * NPS_RULES.annuityPurchaseMin;
  const lumpSumWithdrawal = totalCorpus * (1 - NPS_RULES.annuityPurchaseMin);
  const monthlyPension = (annuityCorpus * NPS_RULES.annuityRate) / 12;

  // Inflation adjustment
  const inflationFactor = Math.pow(1 + NPS_RULES.inflationRate, years);
  const realCorpus = totalCorpus / inflationFactor;

  // Yearly timeline for charts
  const timeline = [];
  for (let yr = 0; yr <= years; yr += 5) {
    const m = yr * 12;
    const c = m === 0 ? 0 :
      monthlyContribution *
      ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) *
      (1 + monthlyRate);
    timeline.push({
      age: currentAge + yr,
      corpus: Math.round(c),
      contributed: Math.round(monthlyContribution * m),
    });
  }

  return {
    success: true,
    data: {
      inputs: {
        monthlyContribution,
        currentAge,
        retirementAge,
        riskProfile,
        years,
        annualReturnRate: `${(profile.expectedReturn * 100).toFixed(1)}%`,
      },
      corpus: {
        totalCorpus: Math.round(totalCorpus),
        totalContributed: Math.round(totalContributed),
        wealthGained: Math.round(wealthGained),
        realCorpus: Math.round(realCorpus),
        growthMultiplier: parseFloat((totalCorpus / totalContributed).toFixed(2)),
      },
      withdrawal: {
        annuityCorpus: Math.round(annuityCorpus),
        lumpSumWithdrawal: Math.round(lumpSumWithdrawal),
        estimatedMonthlyPension: Math.round(monthlyPension),
      },
      timeline,
      assumptions: {
        annualReturn: `${(profile.expectedReturn * 100).toFixed(1)}% p.a.`,
        annuityRate: `${(NPS_RULES.annuityRate * 100).toFixed(1)}% p.a.`,
        annuityCorpusPercent: "40% (PFRDA minimum rule)",
        inflationRate: `${(NPS_RULES.inflationRate * 100)}% p.a.`,
        disclaimer: "Projections are estimates based on assumed returns. Not guaranteed. Verify with PFRDA.",
      },
    },
  };
}

/**
 * Reverse-optimize: calculate required contribution for target corpus
 */
function optimizeContribution({
  targetCorpus,
  currentAge,
  retirementAge = 60,
  riskProfile = "moderate",
}) {
  const scenarios = Object.entries(RETURN_RATES).map(([key, profile]) => {
    const monthlyRate = profile.expectedReturn / 12;
    const months = (retirementAge - currentAge) * 12;
    const required =
      (targetCorpus * monthlyRate) /
      ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));

    return {
      riskProfile: key,
      annualReturn: `${(profile.expectedReturn * 100).toFixed(0)}%`,
      requiredMonthlyContribution: Math.ceil(required),
      equityPercent: `${profile.equity * 100}%`,
      debtPercent: `${profile.debt * 100}%`,
    };
  });

  return {
    success: true,
    data: {
      targetCorpus,
      currentAge,
      retirementAge,
      years: retirementAge - currentAge,
      scenarios,
      recommendation: scenarios.find((s) => s.riskProfile === riskProfile),
    },
  };
}

module.exports = { simulateCorpus, optimizeContribution };
