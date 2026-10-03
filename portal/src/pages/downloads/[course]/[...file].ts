/** Raw asset files, served as downloads at /downloads/<course>/<kind>/<file>.md */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCourses, type Asset } from '../../../lib/content';

export const getStaticPaths: GetStaticPaths = async () => {
  const courses = await getCourses();
  return courses.flatMap((course) =>
    course.assetGroups.flatMap((group) =>
      group.assets.map((asset) => ({
        params: { course: course.slug, file: asset.relPath },
        props: { asset },
      })),
    ),
  );
};

export const GET: APIRoute = ({ props }) =>
  new Response((props as { asset: Asset }).asset.raw, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
