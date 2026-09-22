"use client";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { priceToNumber, trackEvent } from "@/lib/analytics";

export interface PackageSelection {
  serviceId: string;
  serviceName: string;
  packageName: string;
  price: string;
  period: string;
}

interface Ctx {
  selection: PackageSelection | null;
  /** Plan currently in view on pricing (for mobile sticky “Book this plan”). */
  focused: PackageSelection | null;
  setFocused: (s: PackageSelection | null) => void;
  openOrder: (s: PackageSelection) => void;
  closeOrder: () => void;
}

const PackageOrderContext = createContext<Ctx>({
  selection: null,
  focused: null,
  setFocused: () => {},
  openOrder: () => {},
  closeOrder: () => {},
});

export const usePackageOrder = () => useContext(PackageOrderContext);

export function PackageOrderProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<PackageSelection | null>(null);
  const [focused, setFocusedState] = useState<PackageSelection | null>(null);

  const setFocused = useCallback((s: PackageSelection | null) => {
    setFocusedState(s);
  }, []);

  const openOrder = (nextSelection: PackageSelection) => {
    const value = priceToNumber(nextSelection.price);
    trackEvent("begin_checkout", {
      currency: "USD",
      value,
      items: [
        {
          item_id: nextSelection.serviceId,
          item_name: nextSelection.serviceName,
          item_variant: nextSelection.packageName,
          price: value,
          quantity: 1,
        },
      ],
    });
    setSelection(nextSelection);
  };

  return (
    <PackageOrderContext.Provider
      value={{
        selection,
        focused,
        setFocused,
        openOrder,
        closeOrder: () => setSelection(null),
      }}
    >
      {children}
    </PackageOrderContext.Provider>
  );
}
