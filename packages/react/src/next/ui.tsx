import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { CmsAppOptions } from "@/index";
import CmsLayout from "../routes/layout";
import CmsDashboardPage from "../routes/page";
import CmsSettingsPage from "../routes/settings/page";
import CmsPostEditorPage from "../routes/[postId]/page";

interface CatchAllParams {
  slug?: string[];
};

function getSlugPath(input: CatchAllParams["slug"]) {
  if (!input) return [];
  return input.filter((segment) => segment.length > 0);
}

export function CmsCatchAllPage(options: CmsAppOptions) {
  return {
    async default({ params }: { params: CatchAllParams | Promise<CatchAllParams> }) {
      const { slug } = await params;
      const path = getSlugPath(slug);

      let content: ReactNode;
      if (path.length === 0) {
        content = await CmsDashboardPage(options);
      } else if (path.length === 1 && path[0] === "settings") {
        content = await CmsSettingsPage(options);
      } else if (path.length === 2 && path[0] === "posts" && path[1]) {
        content = await CmsPostEditorPage(
          {
            params: Promise.resolve({ postId: path[1] }),
          },
          options,
        );
      } else {
        notFound();
      }

      return CmsLayout({ children: content }, options);
    },
  };
}

