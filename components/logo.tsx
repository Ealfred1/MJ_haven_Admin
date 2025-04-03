import Link from "next/link"
import Image from "next/image"


export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/logo.png" alt="MJ&apos;s Haven Logo" className="rounded-[8px]" width={40} height={40} />
      <span className="font-bold text-[20px] uppercase text-[#374027]">MJ&apos;s Haven</span>
    </Link>
  )
}

