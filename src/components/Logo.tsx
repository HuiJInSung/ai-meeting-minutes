import Link from "next/link";

// 品牌字標：一個印章感的「議」加上名稱
export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="議記 首頁">
      <span className="grid size-8 place-items-center rounded-[9px] bg-accent font-serif text-[17px] font-black leading-none text-accent-ink shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition-transform group-hover:-rotate-6">
        議
      </span>
      <span className="font-serif text-lg font-black tracking-wide">議記</span>
    </Link>
  );
}
