import peopleIntelligence from "../../data/processed/people-intelligence.json";

export const retentionData = peopleIntelligence.retention;
export const compensationData = peopleIntelligence.compensation;


export const topExitReasons = retentionData.reasonDistribution.slice(0, 5);
