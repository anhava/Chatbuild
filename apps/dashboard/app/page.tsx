"use client";
import React from "react";
import Link from "next/link";

interface StatsCardProps {
  title: string;
  value: string;
  link: string;
  linkText: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, link, linkText }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
    <div className="bg-gray-50 px-5 py-3">
      <Link
        href={link}
        className="text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        {linkText}
      </Link>
    </div>
  </div>
);

interface ChatbotDetailsProps {
  name: string;
  description: string;
  apiKey: string;
  logo?: string;
}

const ChatbotDetails: React.FC<ChatbotDetailsProps> = ({
  name,
  description,
  apiKey,
  logo,
}) => (
  <div className="bg-white shadow sm:rounded-lg">
    <div className="px-4 py-5 sm:p-6">
      <div className="sm:flex sm:items-start sm:justify-between">
        <div className="sm:flex sm:items-start">
          {logo ? (
            <div className="flex-shrink-0">
              <img
                className="h-16 w-16 rounded-full"
                src={logo}
                alt={`${name} logo`}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500">
                {name.charAt(0)}
              </span>
            </div>
          )}
          <div className="mt-4 sm:mt-0 sm:ml-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{name}</h3>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">{description}</p>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-500">API Key</p>
              <div className="mt-1 flex items-center">
                <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {apiKey}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(apiKey)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-4">
          <div className="space-y-2">
            <button
              type="button"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // Show integration modal or navigate to integration page
              }}
            >
              View Script Tag
            </button>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {
                // Show integration guide
              }}
            >
              How to Integrate?
            </button>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              onClick={() => {
                // Show delete confirmation
              }}
            >
              Delete Chatbot
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NoChatbot = () => (
  <div className="text-center bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
    <h3 className="text-lg font-medium text-gray-900">No chatbots yet</h3>
    <p className="mt-1 text-sm text-gray-500">Get started by creating a chatbot</p>
    <div className="mt-6">
      <Link
        href="/chatbot/create"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
      >
        Create a Chatbot
      </Link>
    </div>
  </div>
);

export default function DashboardPage() {
  // This would come from your API/database
  const stats = {
    files: "0",
    messages: "0/300",
    urls: "0",
  };

  // Mock data for development
  const mockChatbot: ChatbotDetailsProps = {
    name: "My Test Bot",
    description: "A development chatbot for testing purposes",
    apiKey: "f9cc16b8-8021-4d10-a713-f7a45717cd89",
  };

  // This would come from your API/database
  const chatbot: ChatbotDetailsProps | null = null; // For testing, replace null with mockChatbot

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Files"
          value={stats.files}
          link="/files"
          linkText="View Your Files"
        />
        <StatsCard
          title="Total Messages"
          value={stats.messages}
          link="/chat-history"
          linkText="View Your Chat History"
        />
        <StatsCard
          title="Total Links"
          value={stats.urls}
          link="/urls"
          linkText="View Your URL Links"
        />
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Chatbot</h2>
        {chatbot ? <ChatbotDetails {...mockChatbot} /> : <NoChatbot />}
      </div>
    </div>
  );
}
