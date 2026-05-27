import { WorkspaceClient } from "./WorkspaceClient";

export default function YoungPersonWorkspacePage({ params }: { params: { id: string } }) {
  return <WorkspaceClient childId={params.id} />;
}
