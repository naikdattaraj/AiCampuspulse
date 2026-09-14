"use client";

import { useEffect, useState } from "react";

type Event = {
  id: number;
  title: string;
  location: string;
  date: string;
  description: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
    loadRegisteredEvents();

    const handleStorageChange = () => {
      loadEvents();
      loadRegisteredEvents();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loadEvents = () => {
    const savedEvents = localStorage.getItem("campusEvents");
    if (!savedEvents) {
      setEvents([]);
      return;
    }
    try {
      const parsedEvents = JSON.parse(savedEvents);
      const updatedEvents: Event[] = parsedEvents.map((event: Event) => ({
        ...event,
        description: event.description || "",
      }));
      setEvents(updatedEvents);
    } catch {
      setEvents([]);
    }
  };

  const loadRegisteredEvents = () => {
    const savedRegisteredEvents = localStorage.getItem("registeredEvents");
    if (!savedRegisteredEvents) {
      setRegisteredEvents([]);
      return;
    }
    try {
      setRegisteredEvents(JSON.parse(savedRegisteredEvents));
    } catch {
      setRegisteredEvents([]);
    }
  };

  const handleRegister = (id: number) => {
    if (registeredEvents.includes(id)) return;
    const updated = [...registeredEvents, id];
    setRegisteredEvents(updated);
    localStorage.setItem("registeredEvents", JSON.stringify(updated));
  };

  const handleUnregister = (id: number) => {
    const updated = registeredEvents.filter((eventId) => eventId !== id);
    setRegisteredEvents(updated);
    localStorage.setItem("registeredEvents", JSON.stringify(updated));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not available";
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 border-b border-gray-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            CampusPulse
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Campus Events
          </h1>
          <p className="mt-2 text-gray-600">
            Discover and register for upcoming campus events.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              No events available
            </h2>
            <p className="mt-2 text-gray-500">
              Check back later for upcoming campus events.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const isRegistered = registeredEvents.includes(event.id);

              return (
                <div
                  key={event.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Event Date
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {formatDate(event.date)}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-xl font-bold text-gray-900">
                      {event.title}
                    </h2>

                    <p className="mt-2 text-sm font-medium text-gray-500">
                      {event.location}
                    </p>

                    <p className="mt-3 flex-1 text-sm leading-6 text-gray-600 line-clamp-3">
                      {event.description || "No description provided."}
                    </p>

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        View Details
                      </button>

                      {isRegistered ? (
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          Registered
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(event.id)}
                          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedEvent.title}
                </h2>
                <p className="mt-2 text-sm font-medium text-gray-500">
                  {selectedEvent.location}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(selectedEvent.date)}
                </p>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="text-2xl leading-none text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mt-5">
              {registeredEvents.includes(selectedEvent.id) ? (
                <span className="rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
                  Registered
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-700">
                  Not Registered
                </span>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Description
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-700">
                {selectedEvent.description || "No description provided."}
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              {registeredEvents.includes(selectedEvent.id) ? (
                <button
                  onClick={() => handleUnregister(selectedEvent.id)}
                  className="rounded-lg bg-red-600 px-8 py-3 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Unregister
                </button>
              ) : (
                <button
                  onClick={() => handleRegister(selectedEvent.id)}
                  className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}