/**
 * NPS IntelliPension AI — Core Pension Calculation Engine
 * Aligned with PFRDA NPS Guidelines
 * All projections are estimates. Not guaranteed returns.
 */

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

export const RETURN_RATES = {
  conservative: {
    label: "Conservative",
    equity: 0.25,
    debt: 0.75,
    expectedReturn: 0.08, // 8% p.a.
    description: "Lower risk, stable returns",
  },
  moderate: {
    label: "Moderate",
    equity: 0.50,
    debt: 0.50,
    expectedReturn: 0.10, // 10% p.a.
    description: "Balanced risk-return profile",
  },
  aggressive: {
    label: "Aggressive",
    equity: 0.75,
    debt: 0.25,
    expectedReturn: 0.12, // 12% p.a.
    description: "Higher risk, higher potential returns",
  },
};

export const NPS_RULES = {
  minAgeToJoin: 18,
  maxAgeToJoin: 70,
  retirementAge: 60,
  minContributionMonthly: 500,
  annuityPurchaseMinPercent: 0.40, // Minimum 40% must buy annuity
  annuityRate: 0.055, // ~5.5% annuity rate assumption
  inflationRate: 0.06, // 6% assumed inflation
  taxBenefitSection80C: 150000,
  taxBenefitSection80CCD: 50000, // Additional ₹50,000 under 80CCD(1B)
};

// ─────────────────────────────────────────────
// CORE CALCULATION FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Calculate retirement corpus using compound interest
 * @param {number} monthlyContribution - Monthly NPS contribution in ₹
 * @param {number} currentAge - Current age in years
 * @param {number} retirementAge - Target retirement age
 * @param {string} riskProfile - 'conservative' | 'moderate' | 'aggressive'
 * @returns {object} - Full simulation result
 */
export function calculateRetirementCorpus({
  monthlyContribution,
  currentAge,
  retirementAge = 60,
  riskProfile = "moderate",
  inflationAdjusted = false,
}) {
  const profile = RETURN_RATES[riskProfile];
  const annualRate = profile.expectedReturn;
  const monthlyRate = annualRate / 12;
  const years = retirementAge - currentAge;
  const months = years * 12;

  if (years <= 0) {
    return { error: "Retirement age must be greater than current age." };
  }

  // Future Value of SIP: FV = P × [((1 + r)^n - 1) / r] × (1 + r)
  const fv =
    monthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  const totalContributed = monthlyContribution * months;
  const wealthGained = fv - totalContributed;

  // Annuity calculation (40% minimum must buy annuity)
  const annuityCorpus = fv * NPS_RULES.annuityPurchaseMinPercent;
  const lumpSum = fv * (1 - NPS_RULES.annuityPurchaseMinPercent);
  const estimatedMonthlyPension = (annuityCorpus * NPS_RULES.annuityRate) / 12;

  // Inflation-adjusted corpus (real value)
  const inflationFactor = Math.pow(1 + NPS_RULES.inflationRate, years);
  const realCorpus = inflationAdjusted ? fv / inflationFactor : fv;

  return {
    inputs: {
      monthlyContribution,
      currentAge,
      retirementAge,
      riskProfile,
      years,
      annualReturnRate: (annualRate * 100).toFixed(1) + "%",
    },
    corpus: {
      totalCorpus: Math.round(fv),
      totalContributed: Math.round(totalContributed),
      wealthGained: Math.round(wealthGained),
      realCorpus: Math.round(realCorpus),
      growthMultiplier: (fv / totalContributed).toFixed(2),
    },
    withdrawal: {
      annuityCorpus: Math.round(annuityCorpus),
      lumpSumWithdrawal: Math.round(lumpSum),
      estimatedMonthlyPension: Math.round(estimatedMonthlyPension),
      annuityRate: (NPS_RULES.annuityRate * 100).toFixed(1) + "%",
    },
    assumptions: {
      returnRate: annualRate,
      inflationRate: NPS_RULES.inflationRate,
      annuityPurchasePercent: "40% (PFRDA Minimum)",
      note: "Projections are estimates. Not guaranteed returns.",
    },
  };
}

/**
 * Reverse-calculate required monthly contribution for a target corpus
 * @param {number} targetCorpus - Desired retirement corpus in ₹
 * @param {number} currentAge
 * @param {number} retirementAge
 * @param {string} riskProfile
 * @returns {object}
 */
export function calculateRequiredContribution({
  targetCorpus,
  currentAge,
  retirementAge = 60,
  riskProfile = "moderate",
}) {
  const profile = RETURN_RATES[riskProfile];
  const monthlyRate = profile.expectedReturn / 12;
  const months = (retirementAge - currentAge) * 12;

  // Reverse SIP formula: P = FV × r / [((1+r)^n - 1) × (1+r)]
  const requiredMonthly =
    (targetCorpus * monthlyRate) /
    ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));

  return {
    targetCorpus,
    requiredMonthlyContribution: Math.ceil(requiredMonthly),
    years: retirementAge - currentAge,
    riskProfile,
    annualReturn: (profile.expectedReturn * 100).toFixed(1) + "%",
  };
}

/**
 * Generate multi-scenario comparison across all risk profiles
 * @param {object} baseParams - Base simulation parameters
 * @returns {Array} - Array of scenario results
 */
export function generateScenarioComparison(baseParams) {
  return Object.keys(RETURN_RATES).map((profile) => {
    const result = calculateRetirementCorpus({
      ...baseParams,
      riskProfile: profile,
    });
    return {
      scenario: RETURN_RATES[profile].label,
      riskProfile: profile,
      returnRate: RETURN_RATES[profile].expectedReturn * 100 + "%",
      totalCorpus: result.corpus.totalCorpus,
      monthlyPension: result.withdrawal.estimatedMonthlyPension,
      lumpSum: result.withdrawal.lumpSumWithdrawal,
      growthMultiplier: result.corpus.growthMultiplier,
    };
  });
}

/**
 * Calculate year-by-year growth for chart visualization
 * @param {object} params
 * @returns {Array} - Year-wise corpus data
 */
export function generateGrowthTimeline({
  monthlyContribution,
  currentAge,
  retirementAge = 60,
  riskProfile = "moderate",
}) {
  const profile = RETURN_RATES[riskProfile];
  const monthlyRate = profile.expectedReturn / 12;
  const timeline = [];

  for (let age = currentAge; age <= retirementAge; age++) {
    const months = (age - currentAge) * 12;
    const corpus =
      months === 0
        ? 0
        : monthlyContribution *
          ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
          (1 + monthlyRate);

    const contributed = monthlyContribution * months;

    timeline.push({
      age,
      year: new Date().getFullYear() + (age - currentAge),
      corpus: Math.round(corpus),
      contributed: Math.round(contributed),
      gains: Math.round(corpus - contributed),
    });
  }

  return timeline;
}

/**
 * Calculate tax savings from NPS contributions
 * @param {number} annualContribution - Annual NPS contribution
 * @param {number} taxBracket - Tax rate (0.10, 0.20, 0.30)
 * @returns {object}
 */
export function calculateTaxBenefit({ annualContribution, taxBracket = 0.30 }) {
  const sec80C = Math.min(annualContribution, NPS_RULES.taxBenefitSection80C);
  const additionalBenefit = NPS_RULES.taxBenefitSection80CCD;
  const totalDeduction = Math.min(
    annualContribution,
    sec80C + additionalBenefit
  );
  const taxSaved = totalDeduction * taxBracket;

  return {
    annualContribution,
    deductionUnder80C: sec80C,
    additionalDeductionUnder80CCD: additionalBenefit,
    totalDeduction,
    estimatedTaxSaved: Math.round(taxSaved),
    effectiveCost: Math.round(annualContribution - taxSaved),
    note: "Consult a tax advisor for precise calculations",
  };
}

/**
 * Format Indian currency
 * @param {number} amount
 * @returns {string}
 */
export function formatINR(amount) {
  if (amount >= 10000000) {
    return "₹" + (amount / 10000000).toFixed(2) + " Cr";
  } else if (amount >= 100000) {
    return "₹" + (amount / 100000).toFixed(2) + " L";
  } else {
    return "₹" + amount.toLocaleString("en-IN");
  }
}
