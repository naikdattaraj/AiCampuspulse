"use client";

import { useEffect, useState } from "react";

type Poll = {
  id: number;
  title: string;
  options: string[];
  votes: number[];
  expirationDate: string;
  allowMultiple: boolean;
};

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});
  const [votedPolls, setVotedPolls] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPolls();

    const savedVotes = localStorage.getItem("votedPolls");
    if (savedVotes) {
      try {
        setVotedPolls(JSON.parse(savedVotes));
      } catch {
        setVotedPolls([]);
      }
    }

    const handleStorageChange = () => {
      loadPolls();
      const saved = localStorage.getItem("votedPolls");
      if (saved) {
        try {
          setVotedPolls(JSON.parse(saved));
        } catch {
          setVotedPolls([]);
        }
      }
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

  const handleSingleSelect = (pollId: number, optionIndex: number) => {
    setSelectedOptions({
      ...selectedOptions,
      [pollId]: [optionIndex],
    });
  };

  const handleMultiToggle = (pollId: number, optionIndex: number) => {
    const current = selectedOptions[pollId] || [];
    const alreadySelected = current.includes(optionIndex);

    const updated = alreadySelected
      ? current.filter((index: number) => index !== optionIndex)
      : [...current, optionIndex];

    setSelectedOptions({
      ...selectedOptions,
      [pollId]: updated,
    });
  };

  const handleVote = (poll: Poll) => {
    const selected = selectedOptions[poll.id] || [];

    if (selected.length === 0) {
      setMessage("Please select at least one option before voting.");
      return;
    }

    if (votedPolls.includes(poll.id)) {
      setMessage("You have already voted in this poll.");
      return;
    }

    const updatedPolls = polls.map((p) => {
      if (p.id !== poll.id) return p;

      const updatedVotes = [...p.votes];
      selected.forEach((index: number) => {
        updatedVotes[index] = (updatedVotes[index] || 0) + 1;
      });

      return { ...p, votes: updatedVotes };
    });

    setPolls(updatedPolls);
    localStorage.setItem("campusPolls", JSON.stringify(updatedPolls));

    const updatedVotedPolls = [...votedPolls, poll.id];
    setVotedPolls(updatedVotedPolls);
    localStorage.setItem("votedPolls", JSON.stringify(updatedVotedPolls));

    setMessage("Vote submitted successfully.");
    setTimeout(() => setMessage(""), 3000);
  };

  const getTotalVotes = (poll: Poll) =>
    poll.votes.reduce((total, vote) => total + vote, 0);

  const getPercentage = (votes: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 border-b border-gray-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            CampusPulse
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Campus Polls</h1>
          <p className="mt-2 text-gray-600">
            Share your opinion on campus topics.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            {message}
          </div>
        )}

        {polls.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              No polls available
            </h2>
            <p className="mt-2 text-gray-500">Check back later for new polls.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map((poll) => {
              const totalVotes = getTotalVotes(poll);
              const hasVoted = votedPolls.includes(poll.id);
              const selected = selectedOptions[poll.id] || [];

              return (
                <div
                  key={poll.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900">
                          {poll.title}
                        </h2>
                        {poll.allowMultiple && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            Select multiple
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Expires: {poll.expirationDate}
                      </p>
                    </div>

                    {hasVoted && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Voted
                      </span>
                    )}
                  </div>

                  {!hasVoted && (
                    <div className="mt-6 space-y-3">
                      {poll.options.map((option, index) => (
                        <label
                          key={index}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                        >
                          <input
                            type={poll.allowMultiple ? "checkbox" : "radio"}
                            name={
                              poll.allowMultiple
                                ? undefined
                                : `poll-${poll.id}`
                            }
                            checked={selected.includes(index)}
                            onChange={() =>
                              poll.allowMultiple
                                ? handleMultiToggle(poll.id, index)
                                : handleSingleSelect(poll.id, index)
                            }
                            className="h-4 w-4"
                          />
                          <span className="text-sm text-gray-800">
                            {option}
                          </span>
                        </label>
                      ))}

                      <button
                        onClick={() => handleVote(poll)}
                        className="mt-3 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Submit Vote
                      </button>
                    </div>
                  )}

                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Live Results
                    </h3>

                    {poll.options.map((option, index) => {
                      const percentage = getPercentage(
                        poll.votes[index] || 0,
                        totalVotes
                      );

                      return (
                        <div key={index} className="mb-4">
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="font-medium text-gray-700">
                              {option}
                            </span>
                            <span className="font-semibold text-gray-700">
                              {percentage}%
                            </span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {poll.votes[index] || 0} votes
                          </p>
                        </div>
                      );
                    })}

                    <p className="mt-3 text-sm text-gray-500">
                      Total votes: {totalVotes}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}