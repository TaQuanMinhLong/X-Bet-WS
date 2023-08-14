import { LoadBalancer } from "./load-balancer";

async function test() {
  const loadBalancer = new LoadBalancer();
  await loadBalancer.init();
  for (const number of [...Array(100).keys()].map((_, index) => index + 1)) {
    await loadBalancer.assign(number.toString());
  }
}

await test();
