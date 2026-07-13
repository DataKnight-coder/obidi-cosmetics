/// <reference path="../node_modules/@cloudflare/vitest-pool-workers/types/cloudflare-test.d.ts" />

declare module "cloudflare:test" {
  interface ProvidedEnv {
    DB: D1Database;
    PRODUCT_IMAGES: R2Bucket;
    ANALYTICS_QUEUE: Queue;
    EMAIL_QUEUE: Queue;
    PAYMENT_COORDINATOR: DurableObjectNamespace;
    TEST_MIGRATIONS: D1Migration[];
  }
}
