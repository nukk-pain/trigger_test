export async function loadRuntimeOptions(envLoader) {
    await envLoader.loadEnv();
    return {
        model: envLoader.getModel(),
        maxTokens: envLoader.getMaxTokens(),
        temperature: envLoader.getTemperature()
    };
}
