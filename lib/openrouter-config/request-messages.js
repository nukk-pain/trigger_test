export function buildChatMessages(messages, systemPrompt = '') {
    return systemPrompt ?
        [{ role: 'system', content: systemPrompt }, ...messages] :
        messages;
}

export function buildChatRequestBody(messages, systemPrompt = '') {
    return {
        messages: buildChatMessages(messages, systemPrompt)
    };
}
