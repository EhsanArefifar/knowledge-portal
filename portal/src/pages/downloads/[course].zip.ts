/** All of a course's assets in one zip, laid out as a project's .claude/ folder. */
import type { APIRoute, GetStaticPaths } from 'astro';
import { strToU8, zipSync, type Zippable } from 'fflate';
import { getCourses, type Course } from '../../lib/content';

export const getStaticPaths: GetStaticPaths = async () => {
  const courses = await getCourses();
  return courses.filter((c) => c.assetCount > 0).map((course) => ({ params: { course: course.slug }, props: { course } }));
};

export const GET: APIRoute = ({ props }) => {
  const { course } = props as { course: Course };
  const files: Zippable = {};
  for (const group of course.assetGroups) {
    for (const asset of group.assets) files[asset.installPath] = strToU8(asset.raw);
  }
  return new Response(zipSync(files, { level: 9 }), {
    headers: { 'Content-Type': 'application/zip' },
  });
};
