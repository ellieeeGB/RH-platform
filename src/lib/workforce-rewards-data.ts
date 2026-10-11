import workforceRewards from "../../data/processed/workforce-rewards.json";

export const workforceRewardsData = workforceRewards;
export const workforcePlanningData = workforceRewards.workforcePlanning;
export const totalRewardsData = workforceRewards.totalRewards;

export const topWorkforceHotspots = workforcePlanningData.hotspots.slice(0, 8);
export const benefitPrevalence = totalRewardsData.benefitPrevalence;
export const benefitUsage = totalRewardsData.usageMedianPct;
