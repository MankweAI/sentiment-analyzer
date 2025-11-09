"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FireIcon,
  ChartBarIcon,
  UsersIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

const navigation = [
  { name: "Prospects (Call List)", href: "/dashboard", icon: UsersIcon },
  {
    name: "Sentiment Dashboard",
    href: "/dashboard/report",
    icon: ChartBarIcon,
  },
  { name: "Scripts", href: "/dashboard/scripts", icon: FireIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <span className="text-2xl font-bold text-primary-dark">SASP</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    pathname === item.href
                      ? "border-primary-dark text-slate-900"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                  )}
                >
                  <item.icon
                    className={classNames(
                      pathname === item.href
                        ? "text-primary-dark"
                        : "text-slate-400",
                      "-ml-0.5 mr-2 h-5 w-5"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 rounded-md bg-primary-DEFAULT px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
            >
              <PlusIcon className="h-5 w-5" />
              Add Prospect
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
