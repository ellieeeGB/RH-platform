# Visual direction: consulting editorial

The dashboard keeps the audited data, filtering scopes, comparison methods, exports and detail routes. This pass changes presentation and chart emphasis.

## Research applied

- [Nielsen Norman Group: five principles of visual design](https://www.nngroup.com/articles/principles-visual-design/): scale, hierarchy, balance, contrast and proximity. Applied as a consistent heading hierarchy, aligned KPI strip and numbered sections on the overview.
- [Storytelling with Data: declutter and focus](https://www.storytellingwithdata.com/blog/two-tips-for-better-graphs): reduce competing visual elements and emphasize a relevant comparison. Applied as lighter surfaces, fewer decorative gradients and a selectable line-chart focus.
- [IBM Carbon: visualization palettes](https://www.carbondesignsystem.com/building-blocks/data-visualization/color-palettes): distinguish categories from magnitude. Applied as one hue for single-period bars, categorical colors plus dash patterns for company trajectories, and a sequential table intensity scale.
- [Catch Consulting services](https://www.catchconsulting.com.mx/services): diagnosis, company comparisons and HR decision support. The interface retains the company's navy/turquoise identity and prioritizes the study over promotional imagery.

## Reading order

1. Period and company scope.
2. Reported indicators, response coverage and comparable change.
3. First and last values for the same responding companies.
4. Consulting agenda, evidence and optional detail.

## Data safeguards

The endpoint graphic is rendered only when the existing interpretation permits a comparison. Both values come from `fixed.value`, not from changing available respondent groups. The bars share a zero baseline and maximum within their own graphic. Dates and units are always visible. Missing data is never drawn as zero. A first/last comparison does not imply a continuous trend through intervening periods; the complete trajectory remains in the comparison chart.

Selecting a legend item changes only opacity and line weight. Other series, axis range, table rows, exports and calculations remain unchanged. Line dash patterns and text labels supplement color. Print restores all line opacities.

## Validation

TypeScript, existing analytical regression tests and DOM interaction checks. DOM checks cover fixed-cohort endpoint values, missing-data suppression, legend emphasis/reset, company/period filtering and drill-down. Browser visual QA requires the supported browser skill, which was unavailable during this pass.
