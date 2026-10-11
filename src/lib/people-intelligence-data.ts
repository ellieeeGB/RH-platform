import peopleIntelligence from "../../data/processed/people-intelligence.json";

export const peopleIntelligenceData = peopleIntelligence;
export const retentionData = peopleIntelligence.retention;
export const compensationData = peopleIntelligence.compensation;

export const compensationBandCards = compensationData.bands.map((band) => ({
  ...band,
  iqr: band.q3 - band.q1,
  spread: band.max - band.min,
}));

export const topExitReasons = retentionData.reasonDistribution.slice(0, 5);
