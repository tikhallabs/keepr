// visionService.js — Sends image to GPT-4o Vision and returns extracted text
import Constants from 'expo-constants';

const VISION_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function extractTextFromImage(base64Image) {
  const apiKey = Constants.expoConfig?.extra?.openaiApiKey;

  if (!apiKey) {
    throw new Error('OpenAI API key not found. Check your .env file.');
  }

  const response = await fetch(VISION_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: 'Extract all text from this image exactly as written. Return only the extracted text, nothing else. If there is no text in the image, return: NO_TEXT_FOUND',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log('Vision error:', JSON.stringify(errorData));
    throw new Error(errorData.error?.message || 'Vision API call failed.');
  }

  const data = await response.json();
  const extractedText = data.choices[0]?.message?.content?.trim();

  if (!extractedText || extractedText === 'NO_TEXT_FOUND') {
    throw new Error('No text found in image. Please try again with a clearer photo.');
  }

  return extractedText;
}