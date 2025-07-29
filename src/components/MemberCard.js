import * as React from "react";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/Avatar";
import { ExternalLink, X, MessageCircle } from "lucide-react";
import { cn } from "../lib/utils";

const socialIcons = {
  twitter: X,
  telegram: MessageCircle,
  lens: ExternalLink,
  discord: MessageCircle,
  website: ExternalLink,
};

const socialColors = {
  twitter: "hover:text-blue-400",
  telegram: "hover:text-blue-500",
  lens: "hover:text-green-400",
  discord: "hover:text-indigo-400",
  website: "hover:text-gray-400",
};

export function MemberCard({
  name,
  avatar,
  role,
  socials,
  className,
}) {
  return (
    <Card
      className={cn("transition-all duration-200 hover:shadow-lg", className)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-community/20 text-community">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{name}</h3>
            {role && (
              <p className="text-xs text-muted-foreground truncate">{role}</p>
            )}

            <div className="flex space-x-1 mt-2">
              {socials.map((social, index) => {
                const Icon = socialIcons[social.platform];
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 text-muted-foreground transition-colors",
                      socialColors[social.platform],
                    )}
                    asChild
                  >
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${name} on ${social.platform}`}
                    >
                      <Icon className="h-3 w-3" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
