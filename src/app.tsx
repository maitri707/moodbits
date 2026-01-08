// Main application component with responsive widget layout
import { InteractiveCalendar } from "@/components/interactive-calendar";
import { ThemeProvider } from "@/components/theme-provider";
import { TodoList } from "@/components/todo-list";

import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  DEFAULT_WIDGET_SETTINGS,
  type WidgetSettings,
} from "@/types/widget-settings";

function App() {
  const [settings] = useLocalStorage<WidgetSettings>(
    "moodbits-widget-settings",
    DEFAULT_WIDGET_SETTINGS
  );

  const { showTasks, showCalendar } = settings;

  const hasAnyWidget = showTasks || showCalendar;
  const onlyTodo = showTasks && !showCalendar;
  const todoAndCalendarOnly = showTasks && showCalendar;
  const onlyCalendar = showCalendar && !showTasks;
  const allTwo = showTasks && showCalendar;

  const renderContent = () => {
    if (!hasAnyWidget) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground text-base lowercase">
            no widgets enabled *_*
          </p>
        </div>
      );
    }

    if (onlyTodo) {
      return (
        <div className="flex min-h-0 flex-1">
          <TodoList fullSize />
        </div>
      );
    }

    if (todoAndCalendarOnly) {
      return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
          <div className="flex min-h-0 shrink-0">
            <TodoList />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1">
            <InteractiveCalendar />
          </div>
        </div>
      );
    }


    if (onlyCalendar) {
      return (
        <div className="flex min-h-0 flex-1">
          <InteractiveCalendar />
        </div>
      );
    }

    if (allTwo) {
      return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
          <div className="flex min-h-0 shrink-0 flex-col gap-3">
            <TodoList />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1">
            <InteractiveCalendar />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <main className="flex min-h-0 flex-1 flex-col p-3">
          {renderContent()}
        </main>

        
      </div>
    </ThemeProvider>
  );
}

export default App;
