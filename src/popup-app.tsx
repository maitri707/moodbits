// Extension popup settings panel with widget toggles and attribution
import {
  IconCalendarHeart,
  IconChecklist,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react";
import { ThemeProvider } from "@/components/theme-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  DEFAULT_WIDGET_SETTINGS,
  type WidgetSettings,
} from "@/types/widget-settings";

function PopupApp() {
  const [settings, setSettings] = useLocalStorage<WidgetSettings>(
    "moodbits-widget-settings",
    DEFAULT_WIDGET_SETTINGS
  );
  const [username, setUsername] = useLocalStorage<string>(
    "moodbits-username",
    "you"
  );

  const toggleSetting = (key: keyof WidgetSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDownloadBackup = () => {
    const keys = [
      "moodbits-widget-settings",
      "moodbits-todos",
      "mood-calendar-2026-data",
      "mood-calendar-show-numbers",
      "vite-ui-theme",
    ];

    const backup: Record<string, unknown> = {};
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) {
        backup[key] = JSON.parse(value);
      }
    }

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `moodbits-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUploadBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        for (const key of Object.keys(backup)) {
          localStorage.setItem(key, JSON.stringify(backup[key]));
        }
        // Reload the page to reflect changes
        window.location.reload();
      } catch {
        console.error("Invalid backup file. Please select a valid JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset the input
    event.target.value = "";
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div
        className="relative w-72 overflow-hidden rounded-xl bg-background p-4"
        style={{ boxShadow: "0 0 18px rgba(255, 255, 255, 0.12)" }}
      >
        <header className="flex items-center gap-3">
          <img
            alt="moodbits logo"
            className="size-10"
            height={40}
            src="/moodbits-logo-128.png"
            width={40}
          />
          <div>
            <h1 className="font-semibold text-sm">moodbits</h1>
            <p className="text-pretty text-[11px] text-muted-foreground">
              your minimal mood calendar
            </p>
          </div>
        </header>

        <Separator className="my-3" />

        <div className="space-y-2">
          <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
            Widgets
          </p>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-accent/30">
              <div className="flex items-center gap-2">
                <IconChecklist className="size-3.5 text-muted-foreground" />
                <Label className="cursor-pointer text-xs" htmlFor="show-tasks">
                  tasks
                </Label>
              </div>
              <Switch
                checked={settings.showTasks}
                className="scale-90"
                id="show-tasks"
                onCheckedChange={() => toggleSetting("showTasks")}
              />
            </div>

            <div className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-accent/30">
              <div className="flex items-center gap-2">
                <IconCalendarHeart className="size-3.5 text-muted-foreground" />
                <Label
                  className="cursor-pointer text-xs"
                  htmlFor="show-calendar"
                >
                  mood calendar
                </Label>
              </div>
              <Switch
                checked={settings.showCalendar}
                className="scale-90"
                id="show-calendar"
                onCheckedChange={() => toggleSetting("showCalendar")}
              />
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
            Profile
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs" htmlFor="username">
              your name
            </Label>
            <Input
              className="h-7 border-border/50 text-xs lowercase"
              id="username"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="enter your name"
              value={username}
            />
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
            Data
          </p>
          <div className="flex gap-2">
            <button
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/50 py-2 text-[11px] transition-colors hover:bg-accent/30"
              onClick={handleDownloadBackup}
              type="button"
            >
              <IconDownload className="size-3.5" />
              backup
            </button>
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border/50 py-2 text-[11px] transition-colors hover:bg-accent/30">
              <IconUpload className="size-3.5" />
              restore
              <input
                accept=".json"
                className="hidden"
                onChange={handleUploadBackup}
                type="file"
              />
            </label>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-center">
          <p className="text-[10px] text-muted-foreground">
            customised with ♥ by mai3
          </p>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default PopupApp;
