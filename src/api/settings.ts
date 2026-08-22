import api from "./axiosInstance";
import type { ApiEnvelope, SettingsPage, SettingsPageKey } from "../types";

/**
 * about / terms / privacy are the same shape behind the scenes — one document
 * holding a block of admin-editable HTML, served by the settings page factory
 * in the backend. Each is mounted at its own path.
 */
export const SETTINGS_PAGES: {
  key: SettingsPageKey;
  label: string;
  path: string;
  blurb: string;
}[] = [
  {
    key: "privacy",
    label: "Privacy Policy",
    path: "/api/v1/privacy",
    blurb: "Shown on the website's privacy page and at the public policy URL.",
  },
  {
    key: "terms",
    label: "Terms & Conditions",
    path: "/api/v1/terms",
    blurb: "Shown on the website's terms page.",
  },
  {
    key: "about",
    label: "About Us",
    path: "/api/v1/about",
    blurb: "Shown on the website's about page.",
  },
];

const pathFor = (key: SettingsPageKey) => {
  const page = SETTINGS_PAGES.find((entry) => entry.key === key);
  if (!page) throw new Error(`Unknown settings page: ${key}`);
  return page.path;
};

export async function fetchSettingsPage(key: SettingsPageKey): Promise<SettingsPage | null> {
  const { data } = await api.get<ApiEnvelope<SettingsPage | null>>(pathFor(key));
  return data.data ?? null;
}

export async function updateSettingsPage(
  key: SettingsPageKey,
  description: string,
): Promise<SettingsPage> {
  const { data } = await api.patch<ApiEnvelope<SettingsPage>>(
    `${pathFor(key)}/update`,
    { description },
  );
  if (!data.data) throw new Error(data.message || "Update failed.");
  return data.data;
}
