import type { MetadataRoute } from "next";

const baseUrl = "https://founderabovethefold.com";

const routes = ["/", "/product", "/pricing", "/try", "/waitlist", "/no-circles", "/privacy", "/cookies", "/terms", "/manual"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
