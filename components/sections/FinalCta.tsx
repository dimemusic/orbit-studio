import { G, Tag } from "../ui/Bits";
import { Button } from "../ui/Button";
import { HomeSection } from "../ui/HomeSection";

/** 07: same header system as every home section (only the hero is huge), then one block of CTAs. */
export function FinalCta() {
  return (
    <HomeSection
      id="start"
      label="Старт за хвилину"
      color="blue"
      title={
        <>
          Дай файлам <G>пам&apos;ять.</G>
        </>
      }
      lead={
        <>
          Перші зв&apos;язки <span translate="no">Cloud Sphere</span> знайде за кілька хвилин.
        </>
      }
    >
      <div className="plate flex flex-col items-center px-4">
        <div data-reveal className="flex flex-wrap justify-center gap-3">
          <Button href="/signup">Почати безкоштовно</Button>
          <Button href="mailto:hello@cloudsphere.example" variant="secondary">
            Написати нам
          </Button>
        </div>

        <ul data-reveal style={{ ["--d" as string]: "80ms" }} className="mt-8 flex flex-wrap justify-center gap-2">
          <li><Tag color="blue">20 ГБ безкоштовно</Tag></li>
          <li><Tag color="green">Без картки</Tag></li>
          <li><Tag color="cyan">Імпорт з Google Drive</Tag></li>
        </ul>

        <p id="login" className="legible mt-10 text-[14px] text-body">
          Вже з нами?{" "}
          <a href="#login" className="text-fg underline decoration-white/30 underline-offset-4 hover:decoration-fg">
            Увійти
          </a>
        </p>
      </div>
    </HomeSection>
  );
}
