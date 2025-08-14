/** @format */

"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { NavItem } from "./types";
import SidebarMenuItem from "./SidebarMenuItem";
import {
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  TableIcon,
  UserCircleIcon,
} from "./icons";

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    name: "Equipements",
    icon: <ListIcon />,
    path: "/equipments",
  },
  {
    icon: <UserCircleIcon />,
    name: "Utilisateurs",
    path: "/users",
  },
  {
    name: "Scan Logs",
    icon: <TableIcon />,
    path: "/scan-logs",
  },
  {
    name: "Familles",
    icon: <PageIcon />,
    path: "/families",
  },
  {
    icon: <GridIcon />,
    name: "Catégories",
    path: "/categories",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLUListElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50
        ${(isExpanded || isHovered || isMobileOpen) ? "border-r border-gray-200 dark:border-gray-800" : ""}
        ${(isExpanded || isHovered || isMobileOpen) ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar'>
        <nav className='mb-6'>
          <div className='flex flex-col gap-4'>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 mt-6 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}>
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              <ul className='flex flex-col gap-4'>
                {navItems.map((item, index) => {
                  const key = `main-${index}`;
                  return (
                    <SidebarMenuItem
                      key={key}
                      item={item}
                      isExpanded={isExpanded}
                      isHovered={isHovered}
                      isMobileOpen={isMobileOpen}
                      isActive={isActive}
                      openSubmenu={openSubmenu}
                      handleSubmenuToggle={handleSubmenuToggle}
                      index={index}
                      menuType='main'
                      subMenuHeight={subMenuHeight[key] || 0}
                      subMenuRef={(el) => {
                        if (el) subMenuRefs.current[key] = el;
                      }}
                    />
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;