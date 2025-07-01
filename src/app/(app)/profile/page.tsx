"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { users } from "@/lib/data";
import { Camera, Edit2 } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(users.find((u) => u.id === "user1")!);
  const [name, setName] = useState(user.name);
  const [status, setStatus] = useState(user.status);
  const { toast } = useToast();

  const handleSave = () => {
    setUser({ ...user, name, status });
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved.",
    });
  };

  return (
    <div className="h-full flex flex-col">
       <CardHeader className="p-4 border-b">
         <CardTitle className="font-headline text-2xl">Profile</CardTitle>
       </CardHeader>
       <CardContent className="p-6 flex-grow overflow-y-auto flex flex-col items-center">
        <div className="relative mb-6">
          <Avatar className="h-32 w-32 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-4xl">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            className="absolute bottom-1 right-1 rounded-full h-10 w-10"
          >
            <Camera className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground">Your Name</Label>
                <div className="flex items-center gap-2">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="text-lg" />
                    <Edit2 className="h-5 w-5 text-muted-foreground" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status" className="text-muted-foreground">About</Label>
                 <div className="flex items-center gap-2">
                    <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} />
                    <Edit2 className="h-5 w-5 text-muted-foreground" />
                </div>
            </div>

            <Button onClick={handleSave} className="w-full" size="lg">
                Save Changes
            </Button>
        </div>
       </CardContent>
    </div>
  );
}
