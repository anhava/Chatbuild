"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface ChatbotFormData {
  name: string;
  description: string;
  welcomeMessage: string;
  themeColor: string;
  logo?: File;
}

export default function CreateChatbotPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ChatbotFormData>({
    name: "",
    description: "",
    welcomeMessage: "Hello! How can I help you today?",
    themeColor: "#2563eb", // Default blue
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // This would be your API endpoint
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create chatbot");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating chatbot:", error);
      // Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Create New Chatbot
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Chatbot Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="My Awesome Chatbot"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="What is this chatbot for?"
            />
          </div>
        </div>

        <div>
          <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">
            Welcome Message
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="welcomeMessage"
              id="welcomeMessage"
              required
              value={formData.welcomeMessage}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Hello! How can I help you today?"
            />
          </div>
        </div>

        <div>
          <label htmlFor="themeColor" className="block text-sm font-medium text-gray-700">
            Theme Color
          </label>
          <div className="mt-1 flex items-center space-x-3">
            <input
              type="color"
              name="themeColor"
              id="themeColor"
              value={formData.themeColor}
              onChange={handleChange}
              className="h-8 w-8 rounded-md border border-gray-300 cursor-pointer"
            />
            <span className="text-sm text-gray-500">
              Choose a color for your chatbot&apos;s theme
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
            Logo (Optional)
          </label>
          <div className="mt-1">
            <input
              type="file"
              name="logo"
              id="logo"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Recommended: Square image, at least 100x100px
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Chatbot"}
          </button>
        </div>
      </form>
    </div>
  );
}
