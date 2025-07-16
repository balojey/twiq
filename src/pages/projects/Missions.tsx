
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function Missions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Missions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-lg">Mission Title</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">Assigned to: John Doe</p>
                <p className="text-sm text-gray-500 mb-4">Deadline: 2025-12-31</p>
                <Progress value={50} className="mb-2" />
                <Badge>In Progress</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
