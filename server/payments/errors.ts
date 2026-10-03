/**
 * Permanent webhook application failure.
 * Route should acknowledge (HTTP 200) so the provider does not infinite-retry.
 */
export class WebhookNonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookNonRetryableError";
  }
}
