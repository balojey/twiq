
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Characters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Characters</CardTitle>
        <Button className="ml-auto">Create Character</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
                <p className="font-semibold">Character Name</p>
                <p className="text-sm text-gray-500">Character Trait</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
