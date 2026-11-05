import { createElement, lazy, Suspense, useState } from 'react';

export default function useLazyScene(loader) {
  const [LoadedScene] = useState(() => lazy(loader));
  return createElement(Suspense, { fallback: null }, createElement(LoadedScene));
}
