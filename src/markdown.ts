import type { MarkdownRenderer } from "@astrojs/markdown-remark";
import { unified } from "@astrojs/markdown-remark";
import { remarkVideoEmbed } from "./plugins/remark-video-embed";

export const markdownProcessor = unified({
  remarkPlugins: [remarkVideoEmbed],
});

let renderer: MarkdownRenderer | null = null;

async function getRenderer(): Promise<MarkdownRenderer> {
  renderer ??= await markdownProcessor.createRenderer({});
  return renderer;
}

export async function renderMarkdownBody(
  body: string,
  frontmatter: Record<string, unknown> = {}
): Promise<string> {
  const markdown = await getRenderer();
  return (await markdown.render(body, { frontmatter })).code;
}
