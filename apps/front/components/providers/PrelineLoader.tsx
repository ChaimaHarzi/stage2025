"use client";
import { useEffect } from "react";

let prelineLoaded = false;

export default function PrelineLoader() {
  useEffect(() => {
    if (!prelineLoaded) {
      import('preline').then(() => {
        prelineLoaded = true;
      });
    }
  }, []);

  return null;
}