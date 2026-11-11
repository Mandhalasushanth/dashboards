import type { Href } from "expo-router";

/**
 * Route strings assembled at runtime (service config, saved drafts, resume links) cannot be
 * checked against Expo Router's typed routes. This is the single place they are trusted.
 */
export const toHref = (path: string): Href => path as Href;
