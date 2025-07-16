
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Users() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User & Profiles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center p-4">
                <Avatar className="mr-4">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=a042581f4e29026704d`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">User Name</p>
                  <p className="text-sm text-gray-500">user.name@example.com</p>
                </div>
                <Badge className="ml-auto">Active</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
