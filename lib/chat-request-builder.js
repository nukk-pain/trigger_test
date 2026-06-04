import {
    buildChatMessages as buildMessages,
    buildChatRequestBody as buildBody
} from './openrouter-config/request-messages.js';

export function buildChatMessages(messages, systemPrompt = '') {
    return buildMessages(messages, systemPrompt);
}

export function buildChatRequestBody(messages, systemPrompt = '') {
    return buildBody(messages, systemPrompt);
}
