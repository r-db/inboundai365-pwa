"""
LLM Service with streaming support
Handles communication with OpenAI and Anthropic APIs
"""
import os
import logging
from openai import OpenAI
from anthropic import Anthropic

logger = logging.getLogger(__name__)

class LLMService:
    """Service for interacting with LLM providers"""

    def __init__(self, config):
        self.config = config
        self.openai_client = None
        self.anthropic_client = None

        # Initialize OpenAI if key is available
        if config.get('OPENAI_API_KEY'):
            self.openai_client = OpenAI(api_key=config['OPENAI_API_KEY'])
            logger.info("OpenAI client initialized")

        # Initialize Anthropic if key is available
        if config.get('ANTHROPIC_API_KEY'):
            self.anthropic_client = Anthropic(api_key=config['ANTHROPIC_API_KEY'])
            logger.info("Anthropic client initialized")

    def chat_openai(self, messages, model=None, stream=False):
        """
        Send chat to OpenAI

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name (default from config)
            stream: Enable streaming responses

        Returns:
            Generator if stream=True, dict if stream=False
        """
        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")

        model = model or self.config.get('DEFAULT_MODEL', 'gpt-4')
        max_tokens = self.config.get('MAX_TOKENS', 1000)
        temperature = self.config.get('TEMPERATURE', 0.7)

        try:
            logger.info(f"OpenAI request: model={model}, stream={stream}")

            # Enable stream_options to get usage data during streaming
            stream_options = {"include_usage": True} if stream else None

            response = self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=stream,
                stream_options=stream_options
            )

            if stream:
                return self._stream_openai_response(response, model)
            else:
                return {
                    'success': True,
                    'message': response.choices[0].message.content,
                    'model': model,
                    'usage': {
                        'prompt_tokens': response.usage.prompt_tokens,
                        'completion_tokens': response.usage.completion_tokens,
                        'total_tokens': response.usage.total_tokens
                    }
                }
        except Exception as e:
            error_msg = str(e)
            logger.error(f"OpenAI error: {error_msg}")
            if stream:
                # Return a generator that yields an error for streaming
                def error_generator():
                    yield {'type': 'error', 'error': error_msg}
                return error_generator()
            else:
                return {'success': False, 'error': error_msg}

    def _stream_openai_response(self, response, model):
        """Generator for OpenAI streaming responses"""
        try:
            usage_data = None
            for chunk in response:
                # Send content chunks
                if chunk.choices and len(chunk.choices) > 0 and chunk.choices[0].delta.content:
                    yield {
                        'type': 'chunk',
                        'content': chunk.choices[0].delta.content,
                        'model': model
                    }

                # Capture usage data if available (comes in final chunk when stream_options is enabled)
                if hasattr(chunk, 'usage') and chunk.usage is not None:
                    usage_data = {
                        'prompt_tokens': chunk.usage.prompt_tokens,
                        'completion_tokens': chunk.usage.completion_tokens,
                        'total_tokens': chunk.usage.total_tokens
                    }
                    logger.info(f"OpenAI usage captured: {usage_data}")

            # Send final done message with usage
            yield {'type': 'done', 'model': model, 'usage': usage_data}

        except Exception as e:
            logger.error(f"OpenAI streaming error: {str(e)}")
            yield {'type': 'error', 'error': str(e)}

    def chat_claude(self, messages, model=None, stream=False):
        """
        Send chat to Claude

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name (default: claude-3-sonnet)
            stream: Enable streaming responses

        Returns:
            Generator if stream=True, dict if stream=False
        """
        if not self.anthropic_client:
            raise ValueError("Anthropic API key not configured")

        model = model or 'claude-3-5-sonnet-20241022'
        max_tokens = self.config.get('MAX_TOKENS', 1000)

        try:
            logger.info(f"Claude request: model={model}, stream={stream}")

            # Convert OpenAI format to Anthropic format
            system_msg = next((m['content'] for m in messages if m['role'] == 'system'), None)
            user_messages = [m for m in messages if m['role'] != 'system']

            response = self.anthropic_client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=system_msg if system_msg else "You are a helpful assistant.",
                messages=user_messages,
                stream=stream
            )

            if stream:
                return self._stream_claude_response(response, model)
            else:
                return {
                    'success': True,
                    'message': response.content[0].text,
                    'model': model,
                    'usage': {
                        'input_tokens': response.usage.input_tokens,
                        'output_tokens': response.usage.output_tokens
                    }
                }
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Claude error: {error_msg}")
            if stream:
                # Return a generator that yields an error for streaming
                def error_generator():
                    yield {'type': 'error', 'error': error_msg}
                return error_generator()
            else:
                return {'success': False, 'error': error_msg}

    def _stream_claude_response(self, response, model):
        """Generator for Claude streaming responses"""
        try:
            usage_data = None
            for event in response:
                if event.type == 'content_block_delta':
                    if hasattr(event.delta, 'text'):
                        yield {
                            'type': 'chunk',
                            'content': event.delta.text,
                            'model': model
                        }
                elif event.type == 'message_start':
                    # Capture usage data from message start
                    if hasattr(event, 'message') and hasattr(event.message, 'usage'):
                        usage_data = {
                            'input_tokens': event.message.usage.input_tokens,
                            'output_tokens': event.message.usage.output_tokens
                        }
                        logger.info(f"Claude usage (start): {usage_data}")
                elif event.type == 'message_delta':
                    # Update usage with final counts
                    if hasattr(event, 'usage'):
                        if not usage_data:
                            usage_data = {}
                        usage_data['output_tokens'] = event.usage.output_tokens
                        logger.info(f"Claude usage (delta): {usage_data}")
                elif event.type == 'message_stop':
                    logger.info(f"Claude final usage: {usage_data}")
                    yield {'type': 'done', 'model': model, 'usage': usage_data}

        except Exception as e:
            logger.error(f"Claude streaming error: {str(e)}")
            yield {'type': 'error', 'error': str(e)}
