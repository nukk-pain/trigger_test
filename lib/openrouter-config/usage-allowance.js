export function assertUsageAllowance(usageTracker, envLoader) {
    const canMakeRequest = usageTracker.canShowClientRequestAllowance
        ? usageTracker.canShowClientRequestAllowance(envLoader)
        : usageTracker.canMakeRequest(envLoader);

    if (!canMakeRequest) {
        const remaining = usageTracker.getRemainingRequests(envLoader);
        throw new Error(`일일 또는 월간 사용량 한도에 도달했습니다. 남은 요청: ${remaining}회`);
    }
}
