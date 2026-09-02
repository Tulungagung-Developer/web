import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/constants";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-lg bg-card text-foreground md:hidden"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Tutup menu" : "Buka menu"}
      >
        {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-18 z-40 flex flex-col gap-2 rounded-xl border border-border bg-card p-3 md:hidden motion-preset-fade motion-preset-slide-down-sm">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.path}
              className="rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/join"
            className="mt-2 rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsOpen(false)}
          >
            Bergabung
          </a>
        </div>
      )}
    </>
  );
}
