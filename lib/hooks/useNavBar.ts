"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth.service";
import { attendanceService } from "@/lib/services/attendance.service";
import type { UserRole } from "@/lib/types/user";
import {
  type DropdownKey,
  hrDropdownLinks,
  financeDropdownLinks,
  operationsDropdownLinks,
  workspaceDropdownLinks,
  settingsDropdownLinks,
} from "@/lib/constants/nav";

/**
 * Owns the NavBar's interaction state: which top-level dropdown / sub-menu is
 * open, the avatar and work-mode menus, the current role, and the shared
 * trigger/menu refs the outside-click handler closes on. Presentation lives in
 * the co-located `_components`.
 */
export function useNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null);
  const [subOpen, setSubOpen] = useState<string | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [workMode, setWorkMode] = useState("office");
  const [workModeOpen, setWorkModeOpen] = useState(false);
  const [userRole] = useState<UserRole>(() => authService.getUser()?.role ?? "employee");
  const [user] = useState(() => authService.getUser());

  const workModeRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const hrTriggerRef = useRef<HTMLDivElement>(null);
  const hrMenuRef = useRef<HTMLDivElement>(null);
  const financeTriggerRef = useRef<HTMLDivElement>(null);
  const financeMenuRef = useRef<HTMLDivElement>(null);
  const workspaceTriggerRef = useRef<HTMLDivElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const operationsTriggerRef = useRef<HTMLDivElement>(null);
  const operationsMenuRef = useRef<HTMLDivElement>(null);
  const settingsTriggerRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const triggerRefs: Record<DropdownKey, React.RefObject<HTMLDivElement | null>> = {
    hr: hrTriggerRef,
    finance: financeTriggerRef,
    operations: operationsTriggerRef,
    workspace: workspaceTriggerRef,
    settings: settingsTriggerRef,
  };
  const menuRefs: Record<DropdownKey, React.RefObject<HTMLDivElement | null>> = {
    hr: hrMenuRef,
    finance: financeMenuRef,
    operations: operationsMenuRef,
    workspace: workspaceMenuRef,
    settings: settingsMenuRef,
  };

  const matchesPath = (links: { href: string; subItems?: { href: string }[] }[]) =>
    links.some((l) => l.href === pathname || l.subItems?.some((s) => s.href === pathname));

  const activeFlags: Record<DropdownKey, boolean> = {
    hr: matchesPath(hrDropdownLinks),
    finance: matchesPath(financeDropdownLinks),
    operations: matchesPath(operationsDropdownLinks),
    workspace: matchesPath(workspaceDropdownLinks),
    settings: matchesPath(settingsDropdownLinks),
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const inHRTrigger = hrTriggerRef.current?.contains(target);
      const inHRMenu = hrMenuRef.current?.contains(target);
      const inFinanceTrigger = financeTriggerRef.current?.contains(target);
      const inFinanceMenu = financeMenuRef.current?.contains(target);
      const inOperationsTrigger = operationsTriggerRef.current?.contains(target);
      const inOperationsMenu = operationsMenuRef.current?.contains(target);
      const inWorkspaceTrigger = workspaceTriggerRef.current?.contains(target);
      const inWorkspaceMenu = workspaceMenuRef.current?.contains(target);
      const inSettingsTrigger = settingsTriggerRef.current?.contains(target);
      const inSettingsMenu = settingsMenuRef.current?.contains(target);
      const inAvatar = avatarRef.current?.contains(target);
      const inWorkMode = workModeRef.current?.contains(target);
      if (!inHRTrigger && !inHRMenu && !inFinanceTrigger && !inFinanceMenu && !inOperationsTrigger && !inOperationsMenu && !inWorkspaceTrigger && !inWorkspaceMenu && !inSettingsTrigger && !inSettingsMenu) {
        setActiveDropdown(null);
        setSubOpen(null);
      }
      if (!inAvatar) {
        setAvatarOpen(false);
      }
      if (!inWorkMode) {
        setWorkModeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleDropdown = (key: DropdownKey) => {
    setActiveDropdown((cur) => (cur === key ? null : key));
    setSubOpen(null);
  };

  const selectWorkMode = async (value: string) => {
    setWorkMode(value);
    setWorkModeOpen(false);
    try {
      await attendanceService.setWorkMode(value);
    } catch {
      // Silent fail
    }
  };

  const logout = async () => {
    setAvatarOpen(false);
    // Auto clock-out before logout
    try {
      await attendanceService.autoClockOut();
    } catch {
      // Silent fail
    }
    await authService.logout();
    router.push("/login");
  };

  return {
    pathname,
    userRole,
    user,
    activeDropdown,
    setActiveDropdown,
    subOpen,
    setSubOpen,
    avatarOpen,
    setAvatarOpen,
    workMode,
    workModeOpen,
    setWorkModeOpen,
    triggerRefs,
    menuRefs,
    workModeRef,
    avatarRef,
    activeFlags,
    toggleDropdown,
    selectWorkMode,
    logout,
  };
}
