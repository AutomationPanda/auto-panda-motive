import type { Link, Paragraph, Parent, Root } from "mdast";
import type { Plugin } from "unified";

const VIDEO_SUFFIX = " - video";
const YOUTUBE_ID = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;

function escapeHtmlAttr(value: string): string {
  return value.replace(/"/g, "&quot;");
}

function youtubeEmbedUrl(url: string): string | null {
  const match = url.match(YOUTUBE_ID);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function parseVideoLink(link: Link): { embedUrl: string; title: string } | null {
  if (link.children.length !== 1 || link.children[0].type !== "text") {
    return null;
  }

  const text = link.children[0].value.trim();
  let title: string;

  if (text === "video") {
    title = "Video";
  } else if (text.endsWith(VIDEO_SUFFIX)) {
    title = text.slice(0, -VIDEO_SUFFIX.length).trim() || "Video";
  } else {
    return null;
  }

  const embedUrl = youtubeEmbedUrl(link.url);
  return embedUrl ? { embedUrl, title } : null;
}

function isVideoParagraph(node: Paragraph): node is Paragraph & { children: [Link] } {
  return node.children.length === 1 && node.children[0].type === "link";
}

function transformVideoParagraphs(node: Parent): void {
  for (let index = 0; index < node.children.length; index++) {
    const child = node.children[index];

    if (child.type === "paragraph" && isVideoParagraph(child)) {
      const video = parseVideoLink(child.children[0]);
      if (video) {
        node.children[index] = {
          type: "html",
          value: `<div class="video-embed"><iframe src="${video.embedUrl}" title="${escapeHtmlAttr(video.title)}" allowfullscreen loading="lazy"></iframe></div>`,
        };
        continue;
      }
    }

    if ("children" in child) {
      transformVideoParagraphs(child);
    }
  }
}

export const remarkVideoEmbed: Plugin<[], Root> = () => (tree) => {
  transformVideoParagraphs(tree);
};
