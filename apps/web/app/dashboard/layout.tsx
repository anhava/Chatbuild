"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  {
    name: "Knowledge Base",
    children: [
      { name: "Files", href: "/dashboard/files" },
      { name: "URL Links", href: "/dashboard/urls" },
      { name: "FAQs", href: "/dashboard/faqs" },
    ],
  },
  {
    name: "Your Chatbot",
    children: [
      { name: "Create Chatbot", href: "/dashboard/chatbot/create" },
      { name: "Edit Your Chatbot", href: "/dashboard/chatbot/edit" },
      { name: "Install Your Chatbot", href: "/dashboard/chatbot/install" },
    ],
  },
  {
    name: "Live Chat",
    children: [
      { name: "Live Chat Dashboard", href: "/dashboard/live-chat" },
      { name: "Real Time Chat", href: "/dashboard/real-time-chat" },
      { name: "Chat History", href: "/dashboard/chat-history" },
    ],
  },
  { name: "Playground", href: "/dashboard/playground" },
  { name: "Settings", href: "/dashboard/settings" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/dashboard">
                  <span className="text-xl font-bold">Aihio.ai</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <React.Fragment key={item.name}>
                    {!item.children ? (
                      <Link
                        href={item.href}
                        className={classNames(
                          pathname === item.href
                            ? "border-blue-500 text-gray-900"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                        )}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <div className="relative group inline-block text-left">
                        <button className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                          {item.name}
                        </button>
                        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                          <div className="py-1">
                            {item.children.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={classNames(
                                  pathname === subItem.href
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700",
                                  "block px-4 py-2 text-sm hover:bg-gray-50"
                                )}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                FREE PLAN
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
