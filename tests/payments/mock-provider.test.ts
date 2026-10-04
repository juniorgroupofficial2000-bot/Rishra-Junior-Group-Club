import { describe, expect, it } from "vitest";
import { MockPaymentProvider } from "@/server/payments/mock-provider";

describe("MockPaymentProvider", () => {
  it("creates payments as PENDING and can force failure", async () => {
    const provider = new MockPaymentProvider();
    const pending = await provider.createPayment({
      amountPaise: 1000,
      memberId: "member_1",
    });
    expect(pending.status).toBe("PENDING");

    provider.setFailNextPayment(true);
    const failed = await provider.createPayment({
      amountPaise: 1000,
      memberId: "member_1",
    });
    expect(failed.status).toBe("FAILED");
    expect(failed.failureCode).toBe("MOCK_DECLINED");
  });

  it("supports mandate cancel/pause/resume", async () => {
    const provider = new MockPaymentProvider();
    const customer = await provider.createCustomer({
      email: "a@example.com",
      name: "A",
      memberId: "m1",
    });
    const plan = await provider.createPlan({
      name: "Plan",
      amountPaise: 100,
      interval: "monthly",
    });
    const mandate = await provider.createMandate({
      providerCustomerRef: customer.providerCustomerRef,
      providerPlanRef: plan.providerPlanRef,
      memberId: "m1",
    });

    const paused = await provider.pauseMandate(mandate.providerMandateRef);
    expect(paused?.status).toBe("PAUSED");
    const resumed = await provider.resumeMandate(mandate.providerMandateRef);
    expect(resumed?.status).toBe("ACTIVE");
    const cancelled = await provider.cancelMandate(mandate.providerMandateRef);
    expect(cancelled.status).toBe("CANCELLED");
  });
});
