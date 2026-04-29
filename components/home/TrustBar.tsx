import { trustBar } from "@/lib/site";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function TrustBar() {
  return (
    <section className="border-y border-border bg-white">
      <div className="container-page py-6 md:py-8">
        <Reveal>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:justify-between md:gap-x-6">
            {trustBar.map((item) => (
              <li
                key={item.label}
                className="group flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand transition-transform group-hover:scale-110">
                  <Icon name={item.icon as IconName} size={16} />
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
