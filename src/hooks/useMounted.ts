'use client';

import { useEffect, useState } from 'react';

/** Avoid Framer Motion flash — only animate after client mount */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
