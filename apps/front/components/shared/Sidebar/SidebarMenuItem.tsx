/** @format */

/** @format */

import React from "react";
import Link from "next/link";
import { NavItem } from "./types";
import { ChevronDownIcon } from "./icons";

interface SidebarMenuItemProps {
  item: NavItem;
  isExpanded: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  isActive: (path: string) => boolean;
  openSubmenu: { type: "main" | "others"; index: number } | null;
  handleSubmenuToggle: (index: number, menuType: "main" | "others") => void;
  index: number;
  menuType: "main" | "others";
  subMenuHeight: number;
  subMenuRef: (el: HTMLUListElement | null) => void;
}

const Tooltip = ({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) => (
  <div className='relative group flex items-center'>
    {children}
    <div className='absolute left-full ml-4 px-2 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap dark:bg-gray-700'>
      {text}
    </div>
  </div>
);

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  item,
  isExpanded,
  isHovered,
  isMobileOpen,
  isActive,
  openSubmenu,
  handleSubmenuToggle,
  index,
  menuType,
  subMenuHeight,
  subMenuRef,
}) => {
  const isSubMenuOpen =
    openSubmenu?.type === menuType && openSubmenu?.index === index;

  const renderMenuItemContent = () => (
    <>
      <span
        className={`${
          isSubMenuOpen || (item.path && isActive(item.path))
            ? "text-brand-500 dark:text-brand-400"
            : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
        } ${!(isExpanded || isHovered || isMobileOpen) ? '' : ''}`}>
        {item.icon}
      </span>
      {(isExpanded || isHovered || isMobileOpen) && (
        <span className='text-gray-700 group-hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300'>{item.name}</span>
      )}
      {item.subItems && (isExpanded || isHovered || isMobileOpen) && (
        <ChevronDownIcon
          className={`ml-auto w-5 h-5 transition-transform duration-200 ${isSubMenuOpen ? "rotate-180 text-brand-500" : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"}`}
        />
      )}
    </>
  );

  const menuItemClass = `relative flex items-center w-full gap-3 px-3 py-2 font-medium rounded-lg text-theme-sm group ${
    !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
    }`;

  return (
    <li className='relative z-10'>
      {item.subItems ? (
        <button
          onClick={() => handleSubmenuToggle(index, menuType)}
          className={`${menuItemClass} ${
            isSubMenuOpen ? "bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            }`}>
          {renderMenuItemContent()}
        </button>
      ) : (
        item.path && (
          <Link
            href={item.path}
            className={`${menuItemClass} ${
              isActive(item.path) ? "bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
              }`}>
            {renderMenuItemContent()}
          </Link>
        )
      )}
      {!isExpanded && !isHovered && !isMobileOpen && (
        <div className='absolute left-full ml-[-20px] top-1/2 -translate-y-1/2 px-2 py-1 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap dark:bg-gray-700 pointer-events-none z-10'>
          {item.name}
        </div>
      )}
      {item.subItems && (
        <ul
          ref={subMenuRef}
          className='overflow-hidden transition-all duration-300 ease-in-out pl-6 z-10'
          style={{ height: isSubMenuOpen ? subMenuHeight : 0 }}>
          {item.subItems.map((subItem) => (
            <li key={subItem.name}>
              <Link
                href={subItem.path}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-theme-sm font-medium group ${
                  isActive(subItem.path) ? "bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                  }`}>
                <span className='text-gray-700 group-hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300'>{subItem.name}</span>
                {subItem.new && <span className='ml-auto bg-brand-100 dark:bg-brand-500/20 text-brand-500 dark:text-brand-400 text-xs font-medium uppercase px-2.5 py-0.5 rounded-full'>New</span>}
                {subItem.pro && <span className='ml-auto bg-brand-100 dark:bg-brand-500/20 text-brand-500 dark:text-brand-400 text-xs font-medium uppercase px-2.5 py-0.5 rounded-full'>Pro</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarMenuItem;
