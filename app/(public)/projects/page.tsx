import { getProjects } from "@/app/actions/projects";
import { MyProjects } from "@/components/my-projects";
import { NotLogged } from "@/components/not-logged/not-logged";

export default async function ProjectsPage() {
  // const { ok, projects } = await getProjects();

  return <MyProjects />;
}
