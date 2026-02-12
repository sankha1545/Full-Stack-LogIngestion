import { useParams } from "react-router-dom";
import { useLogs } from "@/hooks/useLogs";
import LogsContainer from "@/components/logs/LogsContainer";

export default function AppDetail() {
  const { id } = useParams();

  const { logs, loading } = useLogs(
    { applicationId: id },
    { page: 1, limit: 50 }
  );

  return (
    <div className="p-8">
      <LogsContainer logs={logs} loading={loading} />
    </div>
  );
}
