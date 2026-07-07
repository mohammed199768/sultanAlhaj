export interface Metric {
  value: string;
  label: string;
  context: string;
}

/**
 * Selected campaign snapshots — real figures supplied for the portfolio.
 * Labelled as snapshots to avoid over-claiming aggregate performance.
 */
export const results: Metric[] = [
  { value: "44,796", label: "Accounts Reached", context: "Single-campaign snapshot" },
  { value: "36,051", label: "Accounts Reached", context: "Campaign snapshot" },
  { value: "19.9K", label: "Accounts Reached", context: "Campaign snapshot" },
  { value: "+84.7%", label: "Audience Growth", context: "Period over period" },
  { value: "10,080", label: "Profile Activity", context: "Interactions snapshot" },
  { value: "9,403", label: "Profile Visits", context: "Campaign snapshot" },
  { value: "677", label: "External Link Taps", context: "Campaign snapshot" },
  { value: "266,478", label: "Paid Impressions", context: "Paid campaign snapshot" },
  { value: "3,255", label: "Clicks", context: "Paid campaign snapshot" },
  { value: "1.22%", label: "Click Rate", context: "Paid campaign snapshot" },
  { value: "30,390", label: "Video Views", context: "Content snapshot" },
  { value: "11+", label: "Tournament Sponsors", context: "Padel activation" },
];
