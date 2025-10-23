// performance-budget.config.js
export const PERFORMANCE_BUDGET = {
  metrics: {
    lcp: { target: 1200, max: 1500 }, // ms
    inp: { target: 150, max: 200 },    // ms
    cls: { target: 0.05, max: 0.1 },
    fcp: { target: 800, max: 1200 },   // ms
    ttfb: { target: 400, max: 600 },   // ms
    si: { target: 2000, max: 3000 }    // Speed Index
  },
  resources: {
    html: { max: 14 },      // KB gzipped
    css: { max: 20 },       // KB gzipped
    js: {
      initial: { max: 50 }, // KB gzipped
      lazy: { max: 150 }    // KB gzipped total
    },
    fonts: { max: 100 },    // KB total
    images: {
      hero: { max: 120 },   // KB
      other: { max: 50 }    // KB per image
    }
  },
  counts: {
    requests: { initial: 25, total: 60 },
    domains: { max: 4 }
  }
};

export default PERFORMANCE_BUDGET;
