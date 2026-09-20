const {
  monitorEventLoopDelay
} = require('node:perf_hooks');

const histogram = monitorEventLoopDelay({
  resolution: 20
});

histogram.enable();

setInterval(() => {
  console.log({
    mean: histogram.mean,
    p95: histogram.percentile(95),
    p99: histogram.percentile(99),
    max: histogram.max
  });

  histogram.reset();
}, 5000);