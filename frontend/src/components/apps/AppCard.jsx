import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AppCard({ app, onDelete, onRotate }) {
  const navigate = useNavigate();

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{app.name}</CardTitle>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/applications/${app.id}`)}>
              Open
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onRotate(app.id)}>
              <RefreshCw className="w-4 h-4 mr-2" /> Rotate Key
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(app.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          {app.environment}
        </p>
      </CardContent>
    </Card>
  );
}
