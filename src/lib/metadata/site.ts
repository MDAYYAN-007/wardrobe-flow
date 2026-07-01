import type { Metadata } from "next";

export function getSiteMetadata(): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const title = "WardrobeFlow";
  const description =
    "Log daily outfits, manage your wardrobe, and see what you wear most. Built for office, home, travel, and days out.";

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    metadataBase: new URL(siteUrl),
    icons: {
      icon: [
        { url: "/brand/favicon.ico" },
        { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: "/brand/apple-touch-icon.png",
    },
    manifest: "/brand/site.webmanifest",
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: title,
      type: "website",
      images: [
        {
          url: "/brand/og.png",
          width: 1200,
          height: 630,
          alt: `${title} - Log what you wore in seconds`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/og.png"],
    },
  };
}
