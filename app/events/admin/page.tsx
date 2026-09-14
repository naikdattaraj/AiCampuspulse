"use client";

import { FormEvent, useEffect, useState } from "react";

type Event = {
  id: number;
  title: string;
  location: string;
  date: string;
  description: string;
};

export default function AdminEventsPage() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [events, setEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadEvents();
    loadRegistrations();

    const handleStorageChange = () => {
      loadEvents();
      loadRegistrations();
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

  const loadRegistrations = () => {
    const savedRegistrations = localStorage.getItem("registeredEvents");
    if (!savedRegistrations) {
      setRegisteredEvents([]);
      return;
    }
    try {
      setRegisteredEvents(JSON.parse(savedRegistrations));
    } catch {
      setRegisteredEvents([]);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!title.trim()) {
      setMessage("Please enter an event title.");
      return;
    }
    if (!location.trim()) {
      setMessage("Please enter an event location.");
      return;
    }
    if (!date) {
      setMessage("Please select an event date.");
      return;
    }
    if (!description.trim()) {
      setMessage("Please enter an event description.");
      return;
    }

    const newEvent: Event = {
      id: Date.now(),
      title: title.trim(),
      location: location.trim(),
      date,
      description: description.trim(),
    };

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem("campusEvents", JSON.stringify(updatedEvents));

    setTitle("");
    setLocation("");
    setDate("");
    setDescription("");

    setMessage("Event created successfully.");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) return;

    const updatedEvents = events.filter((event) => event.id !== id);
    setEvents(updatedEvents);
    localStorage.setItem("campusEvents", JSON.stringify(updatedEvents));

    const updatedRegistrations = registeredEvents.filter(
      (eventId) => eventId !== id
    );
    setRegisteredEvents(updatedRegistrations);
    localStorage.setItem(
      "registeredEvents",
      JSON.stringify(updatedRegistrations)
    );

    setMessage("Event deleted successfully.");
    setTimeout(() => setMessage(""), 3000);
  };

  const getRegistrationCount = (eventId: number) =>
    registeredEvents.filter((id) => id === eventId).length;

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 border-b border-gray-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            CampusPulse
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Event Management
          </h1>
          <p className="mt-2 text-gray-600">Create and manage campus events.</p>
        </div>

        {/* CREATE EVENT */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Create New Event
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Event Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter event location"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Event Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter event description"
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
              Create Event
            </button>
          </form>
        </div>

        {/* EXISTING EVENTS */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Existing Events
          </h2>

          {events.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">No events created yet.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {events.map((event) => {
                const registrationCount = getRegistrationCount(event.id);

                return (
                  <div
                    key={event.id}
                    className="rounded-lg border border-gray-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-5 md:flex-row">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {event.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                          {event.location}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {event.date}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          {event.description}
                        </p>

                        <div className="mt-4 inline-flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-5 py-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                              Registered
                            </p>
                            <p className="text-2xl font-bold text-blue-700">
                              {registrationCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}