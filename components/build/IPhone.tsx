import { memo, type CSSProperties, type ReactNode } from "react";

/** iPhone-style device: titanium frame, side buttons, Dynamic Island, status bar, home indicator */
export function IPhone({
  style,
  children,
}: {
  style: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div style={style}>
      <PhoneButtons />
      <div className="relative h-full rounded-[54px] bg-[linear-gradient(145deg,#4a4e57,#1d1f24_35%,#2b2e35_70%,#121317)] p-[3px] shadow-[0_50px_100px_-30px_rgb(0_0_0/0.95)]">
        <div className="relative h-full rounded-[51px] bg-black p-[9px]">
          <div className="relative h-full overflow-hidden rounded-[43px] bg-[#f4f0e8] text-[#1a1714]">
            <PhoneStatus />
            <div className="px-4 pt-2">{children}</div>
            {/* home indicator */}
            <i className="absolute bottom-2 left-1/2 h-[5px] w-[110px] -translate-x-1/2 rounded-full bg-[#1a1714]/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** iPhone side buttons: static, memoised */
const PhoneButtons = memo(function PhoneButtons() {
  return (
    <>
      <i className="absolute -left-[3px] top-[108px] h-7 w-[3px] rounded-l bg-[#3a3d44]" />
      <i className="absolute -left-[3px] top-[156px] h-12 w-[3px] rounded-l bg-[#3a3d44]" />
      <i className="absolute -left-[3px] top-[216px] h-12 w-[3px] rounded-l bg-[#3a3d44]" />
      <i className="absolute -right-[3px] top-[172px] h-[72px] w-[3px] rounded-r bg-[#3a3d44]" />
    </>
  );
});

/** iPhone status bar + Dynamic Island: static, memoised */
const PhoneStatus = memo(function PhoneStatus() {
  return (
    <>
            {/* status bar */}
            <div className="flex h-[46px] items-center justify-between px-7 pt-1 text-[13px] font-semibold">
              <span>9:41</span>
              <span className="flex items-center gap-1.5">
                <span className="flex items-end gap-[2px]">
                  {[4, 6, 8, 10].map((h) => (
                    <i
                      key={h}
                      className="w-[3px] rounded-sm bg-[#1a1714]"
                      style={{ height: h }}
                    />
                  ))}
                </span>
                <span className="relative h-[11px] w-[22px] rounded-[3px] border border-[#1a1714]/50 p-[1.5px]">
                  <i className="block h-full w-4/5 rounded-[1.5px] bg-[#1a1714]" />
                </span>
              </span>
            </div>
            {/* Dynamic Island */}
            <i className="absolute left-1/2 top-[13px] h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-black" />
    </>
  );
});
