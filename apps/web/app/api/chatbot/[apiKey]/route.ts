import { corsHeaders, corsOptions } from '../../cors';
import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(
  request: Request,
  { params }: { params: { apiKey: string } }
) {
  // Mock response for development
  return NextResponse.json({
    success: true,
    data: {
      chatBotName: "Development Bot",
      chatBotDescription: "This is a local development chatbot",
      welcomeMessage: "Hello! How can I help you?",
      alertMessage: "Welcome to the development chatbot!",
      colorScheme: "#007bff",
      logoUrl: "https://via.placeholder.com/50",
      suggestionQuestions: [
        "What is your favorite color?",
        "Siblings?",
        "Last vacation?",
        "Dream job?",
        "Pet's name?",
        "Favorite sport?",
        "Favorite hobby?",
        "Favorite animal?"
      ]
    }
  }, {
    headers: corsHeaders()
  });
}
