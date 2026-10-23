import { CheckCircle, Gear, Image as ImageIcon, Package, Files, Tag as TagIcon, UploadSimple } from "@phosphor-icons/react/dist/ssr";
import { PROCESS } from "@/lib/content";
import { along, Caret, Pointer, seg, typed, Win } from "./util";

const M = PROCESS.demo.cms;
const NAV_ICONS = [Package, TagIcon, Files, Gear];
const PHOTO = "linear-gradient(135deg,#f1e3c8,#d8b98c 50%,#a9784f)";

/** CMS: a product is filled in field by field, photo uploads, stock toggles on, «Опублікувати» → the phone preview updates. */
export function CmsScene({ t }: { t: number }) {
  const name = typed(M.nameVal, seg(t, 0.06, 0.28));
  const price = typed(M.priceVal, seg(t, 0.32, 0.4));
  const up = seg(t, 0.45, 0.6);
  const photo = t > 0.6;
  const stock = t > 0.66;
  const pressed = t > 0.74 && t < 0.78;
  const published = t > 0.78;

  const p = along(t, [
    [0, 560, 120],
    [0.05, 440, 130],
    [0.3, 440, 130],
    [0.32, 430, 208],
    [0.42, 430, 208],
    [0.45, 470, 300],
    [0.6, 470, 300],
    [0.64, 586, 402],
    [0.7, 586, 402],
    [0.74, 470, 476],
    [0.8, 470, 476],
    [1, 520, 540],
  ]);
  const down = (t > 0.04 && t < 0.07) || (t > 0.31 && t < 0.33) || (t > 0.44 && t < 0.47) || (t > 0.645 && t < 0.67) || pressed;

  const field = "mt-1.5 flex h-10 items-center rounded-lg border bg-white/[0.03] px-3 text-[14px] text-fg transition-colors duration-300";
  return (
    <Win title={M.win}>
      {/* sidebar */}
      <div className="absolute bottom-0 left-0 top-0 w-[180px] border-r border-white/[0.07] bg-[#0c1018] p-3">
        {M.nav.map((n, i) => {
          const Ic = NAV_ICONS[i];
          return (
            <p key={n} className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] ${i === 0 ? "bg-cyan/12 text-cyan" : "text-body"}`}>
              <Ic size={16} /> {n}
            </p>
          );
        })}
      </div>
      {/* form */}
      <div className="absolute bottom-0 left-[180px] top-0 w-[440px] p-7">
        <p className="text-[12px] text-grey">{M.crumb}</p>
        <label className="mt-5 block text-[12px] text-grey">
          {M.name}
          <span className={`${field} ${t > 0.05 && t < 0.3 ? "border-cyan" : "border-white/15"}`}>
            {name}
            <Caret on={t > 0.05 && t < 0.3} color="#22d3ee" />
          </span>
        </label>
        <label className="mt-4 block w-40 text-[12px] text-grey">
          {M.price}
          <span className={`${field} tabular-nums ${t > 0.31 && t < 0.43 ? "border-cyan" : "border-white/15"}`}>
            {price}
            {price && ` ${M.currency}`}
            <Caret on={t > 0.31 && t < 0.43} color="#22d3ee" />
          </span>
        </label>
        <div className="mt-4 text-[12px] text-grey">
          {M.photo}
          <div className="mt-1.5 flex h-[86px] items-center gap-4 rounded-lg border border-dashed border-white/20 px-4">
            <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md bg-white/[0.05]" style={photo ? { background: PHOTO } : undefined}>
              {!photo && <ImageIcon size={20} className="text-grey" />}
            </span>
            <div className="flex-1">
              <p className="flex items-center gap-2 text-[13px] text-body">
                {photo ? <CheckCircle size={14} weight="fill" className="text-green" /> : <UploadSimple size={14} />}
                {photo ? "varenyky.jpg" : up > 0 ? `${M.upload} ${Math.round(up * 100)}%` : "varenyky.jpg"}
              </p>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <span className="block h-full rounded-full bg-cyan" style={{ width: `${up * 100}%` }} />
              </span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-lg border border-white/15 px-4 py-3 text-[14px] text-fg">
          {M.stock}
          <span className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${stock ? "bg-green" : "bg-white/15"}`}>
            <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all duration-300 ${stock ? "left-[22px]" : "left-0.5"}`} />
          </span>
        </div>
        <span
          className={`mt-6 inline-flex h-11 items-center gap-2 rounded-full px-6 text-[14px] font-semibold text-white transition-all duration-300 ${published ? "bg-green/90" : "bg-blue"}`}
          style={{ transform: pressed ? "scale(0.95)" : "none", boxShadow: pressed ? "0 0 0 6px rgb(61 139 255 / 0.25)" : "none" }}
        >
          {published && <CheckCircle size={16} weight="fill" />}
          {published ? M.published : M.publish}
        </span>
      </div>
      {/* toast */}
      <div
        className={`absolute right-6 top-5 flex items-center gap-2 rounded-full border border-green/30 bg-[#0d1a17] px-4 py-2 text-[13px] text-green transition-all duration-500 ${
          published ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        <CheckCircle size={15} weight="fill" /> {M.toast}
      </div>
      {/* phone preview */}
      <div className="absolute bottom-6 right-10 top-16 w-[250px] rounded-[30px] border border-white/15 bg-[#05070d] p-2.5 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]">
        <div className="relative h-full overflow-hidden rounded-[22px] bg-[#f4f0e8] p-4 text-[#1a1714]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold">Maina</span>
            <span className={`flex items-center gap-1 text-[10px] font-semibold ${published ? "text-[#1f8f5f]" : "text-[#1a1714]/40"}`}>
              <span className={`size-1.5 rounded-full ${published ? "animate-pulse bg-[#1f8f5f]" : "bg-[#1a1714]/30"}`} />
              {published ? M.live : M.preview}
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="grid h-36 place-items-center transition-all duration-500" style={{ background: photo ? PHOTO : "#ebe5da" }}>
              {!photo && <ImageIcon size={26} className="text-[#1a1714]/25" />}
            </div>
            <div className="p-3">
              <p className="min-h-[36px] text-[14px] font-semibold leading-tight">{name || " "}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[15px] font-semibold tabular-nums">{price ? `${price} ${M.currency}` : ""}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all duration-300 ${stock ? "bg-[#1f8f5f]/15 text-[#1f8f5f] opacity-100" : "opacity-0"}`}
                >
                  {M.stock}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 opacity-60">
            <div className="h-20 rounded-xl bg-[#e6dfd2]" />
            <div className="h-20 rounded-xl bg-[#e6dfd2]" />
          </div>
        </div>
      </div>
      <Pointer x={p.x} y={p.y} down={down} />
    </Win>
  );
}
