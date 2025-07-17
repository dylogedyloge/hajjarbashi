"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, CalendarDays, Award } from "lucide-react";

interface ContactInfoItem {
  uuid: string;
  title: string;
  value: string;
}

interface PublicProfile {
  id: string;
  name: string;
  rate: number;
  avatar: string | null;
  avatar_thumb: string | null;
  show_contact_info: boolean;
  bio: string;
  company_name: string;
  position: string;
  registration_date: number;
  badge_ids: string[] | null;
  city_name: string;
  country_name: string;
  contact_info: ContactInfoItem[];
  badge_details: unknown;
}

export default function PublicProfilePage() {
  const { id, locale } = useParams();
  const lang = Array.isArray(locale) ? locale[0] : locale;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    // fetch(`https://api.hajjardevs.ir/users/profile/${id}`, {
    fetch(`http://192.168.10.6:3001/users/profile/${id}`, {
      headers: lang ? { "x-lang": lang } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        if (!data.success)
          throw new Error(data.message || "Failed to fetch profile");
        setProfile(data.data);
      })
      .catch((err) => setError(err.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [id, locale]);

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 mb-12 py-12">
        <div className="flex gap-8">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="flex-1 flex flex-col gap-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 mb-12 py-12">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Profile not found."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8 shadow-lg border-0">
      <div className="flex flex-col md:flex-row gap-8 p-8">
        {/* Left Column: Avatar, Name, Badges, Contact */}
        <div className="flex flex-col items-center md:items-start gap-6 min-w-[220px] md:w-1/3">
          <Avatar className="w-32 h-32 border-4 border-primary shadow-md">
            {profile.avatar_thumb ? (
              <AvatarImage
                src={`https://api.hajjardevs.ir/${profile.avatar_thumb}`}
                alt={profile.name}
              />
            ) : null}
            <AvatarFallback className="text-4xl font-semibold">
              {profile.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="text-2xl font-bold flex items-center gap-2">
              {profile.name}
              {profile.badge_ids && profile.badge_ids.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Award className="w-5 h-5 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Verified / Special Badge</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {(profile.company_name || profile.position) && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Building2 className="w-4 h-4" />
                <span>{profile.company_name}</span>
                {profile.company_name && profile.position ? (
                  <span>-</span>
                ) : null}
                <span>{profile.position}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.country_name}</span>
              {profile.city_name && <span>- {profile.city_name}</span>}
            </div>
            {profile.registration_date && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <CalendarDays className="w-4 h-4" />
                <span>
                  Member since{" "}
                  {new Date(profile.registration_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          {/* Badges */}
          {profile.badge_ids && profile.badge_ids.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.badge_ids.map((badge) => (
                <Badge key={badge} variant="secondary">
                  {badge}
                </Badge>
              ))}
            </div>
          )}
          {/* Contact Info */}
          {profile.show_contact_info &&
            profile.contact_info &&
            profile.contact_info.length > 0 && (
              <div className="w-full mt-4">
                <Separator className="mb-2" />
                <div className="font-semibold mb-2 text-center md:text-left">
                  Contact Information
                </div>
                <div className="flex flex-col gap-2 items-center md:items-start">
                  {profile.contact_info.map((item) => (
                    <div
                      key={item.uuid}
                      className="flex items-center gap-2 text-sm bg-muted rounded px-3 py-2 w-full"
                    >
                      <span className="font-medium">{item.title}:</span>
                      {item.value.includes("@") ? (
                        <>
                          <Mail className="w-4 h-4 mr-1" />
                          <span>{item.value}</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 mr-1" />
                          <span>{item.value}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
        {/* Right Column: Bio, About, etc. */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <div className="font-semibold text-lg mb-2">About</div>
            <Separator className="mb-3" />
            {profile.bio ? (
              <div className="text-base text-muted-foreground whitespace-pre-line">
                {profile.bio}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No bio provided.
              </div>
            )}
          </div>
          {/* Future: Add more sections here, e.g. Ads, Activity, etc. */}
        </div>
      </div>
    </Card>
  );
}
