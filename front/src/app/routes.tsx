import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { InboxView } from "./components/InboxView";
import { TodayView } from "./components/TodayView";
import { CalendarView } from "./components/CalendarView";
import { CompletedView } from "./components/CompletedView";

function NotFound() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-100 mb-2">404</h2>
        <p className="text-gray-300">Страница не найдена</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: InboxView },
      { path: "today", Component: TodayView },
      { path: "calendar", Component: CalendarView },
      { path: "completed", Component: CompletedView },
      { path: "*", Component: NotFound },
    ],
  },
]);