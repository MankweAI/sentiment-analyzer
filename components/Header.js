"use client";
import Link from "next/link";
import {
  FireIcon,
  ChartBarIcon,
  DocumentPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Prospects", href: "/", icon: UsersIcon },
  { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
  { name: "Scripts", href: "/scripts", icon: FireIcon },
  { name: "Add Prospect", href: "/prospects/new", icon: DocumentPlusIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-4 flex items-center justify-between border-b border-primary-light">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <FireIcon className="h-8 w-auto text-cta-dark" />
              <span className="text-2xl font-bold text-slate-900">SASP</span>
            </Link>
          </div>
          <div className="hidden ml-10 space-x-4 lg:flex">
            {navigation.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={classNames(
                  pathname === link.href ||
                    (link.name === "Prospects" && pathname === "/") ||
                    (link.name === "Scripts" && pathname.startsWith("/scripts"))
                    ? "bg-primary-light text-primary-dark"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                  "inline-flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium transition-colors"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
