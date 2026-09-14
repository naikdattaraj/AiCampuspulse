"use client";

import { FormEvent, useEffect, useState } from "react";

type Poll = {
  id: number;
  title: string;
  options: string[];
  votes: number[];
  expirationDate: string;
  allowMultiple: boolean;
};

export default function AdminPollPage() {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expirationDate, setExpirationDate] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(false);

  const [polls, setPolls] = useState<Poll[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPolls();

    const handleStorageChange = () => {
      loadPolls();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loadPolls = () => {
    const savedPolls = localStorage.getItem("campusPolls");
    if (!savedPolls) {
      setPolls([]);
      return;
    }
    try {
      const parsedPolls = JSON.parse(savedPolls);
      const updatedPolls: Poll[] = parsedPolls.map((poll: Poll) => ({
        ...poll,
        allowMultiple: poll.allowMultiple || false,
      }));
      setPolls(updatedPolls);
    } catch {
      setPolls([]);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const addOption = () => setOptions([...options, ""]);

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!title.trim()) {
      setMessage("Please enter a poll title.");
      return;
    }
    if (options.length < 2) {
      setMessage("A poll must have at least 2 options.");
      return;
    }
    if (options.some((option) => !option.trim())) {
      setMessage("Please fill in all poll options.");
      return;
    }
    if (!expirationDate) {
      setMessage("Please select an expiration date.");
      return;
    }

    const newPoll: Poll = {
      id: Date.now(),
      title: title.trim(),
      options: options.map((option) => option.trim()),
      votes: new Array(options.length).fill(0),
      expirationDate,
      allowMultiple,
    };

    const updatedPolls = [...polls, newPoll];
    setPolls(updatedPolls);
    localStorage.setItem("campusPolls", JSON.stringify(updatedPolls));

    setTitle("");
    setOptions(["", ""]);
    setExpirationDate("");
    setAllowMultiple(false);

    setMessage("Poll created successfully.");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this poll?"
    );
    if (!confirmed) return;

    const updatedPolls = polls.filter((poll) => poll.id !== id);
    setPolls(updatedPolls);
    localStorage.setItem("campusPolls", JSON.stringify(updatedPolls));

    setMessage("Poll deleted successfully.");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 border-b border-gray-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            CampusPulse
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Poll Management
          </h1>
          <p className="mt-2 text-gray-600">Create and manage campus polls.</p>
        </div>

        {/* CREATE POLL */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Create New Poll
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Poll Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter poll question"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Poll Options
              </label>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addOption}
                className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                + Add Option
              </button>
            </div>

            <div>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={allowMultiple}
                  onChange={(e) => setAllowMultiple(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium text-gray-800">
                  Allow students to select multiple options
                </span>
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Expiration Date
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {message && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create Poll
            </button>
          </form>
        </div>

        {/* EXISTING POLLS */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Existing Polls
          </h2>

          {polls.length === 0 ? (
            <p className="text-sm text-gray-500">No polls created yet.</p>
          ) : (
            <div className="space-y-5">
              {polls.map((poll) => (
                <div
                  key={poll.id}
                  className="rounded-lg border border-gray-200 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {poll.title}
                        </h3>
                        {poll.allowMultiple && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            Multiple choice
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        Expires: {poll.expirationDate}
                      </p>

                      <div className="mt-4 space-y-2">
                        {poll.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex justify-between rounded-lg bg-gray-50 px-4 py-2 text-sm"
                          >
                            <span className="text-gray-700">{option}</span>
                            <span className="font-semibold text-gray-700">
                              {poll.votes[index] || 0} votes
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => handleDelete(poll.id)}
                        className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}