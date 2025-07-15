"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Mail, Phone } from "lucide-react";

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
  badge_details: any;
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
    fetch(`https://api.hajjardevs.ir/users/profile/${id}`, {
      headers: lang ? { 'x-lang': lang } : {},
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed to fetch profile");
        setProfile(data.data);
      })
      .catch((err) => setError(err.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [id, locale]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 mb-12 text-center text-muted-foreground py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        Loading profile...
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 mb-12 text-center text-destructive py-12">
        {error || "Profile not found."}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader className="flex flex-col items-center gap-2 pb-2">
        <Avatar className="w-24 h-24 mb-2">
          {profile.avatar_thumb ? (
            <AvatarImage src={`https://api.hajjardevs.ir/${profile.avatar_thumb}`} alt={profile.name} />
          ) : null}
          <AvatarFallback className="text-3xl font-semibold">
            {profile.name?.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="text-2xl font-bold">{profile.name}</div>
        {(profile.company_name || profile.position) && (
          <div className="text-muted-foreground text-sm">
            {profile.company_name}
            {profile.company_name && profile.position ? " - " : ""}
            {profile.position}
          </div>
        )}
        <div className="flex gap-2 text-sm text-muted-foreground mt-1">
          <span>{profile.country_name}</span>
          {profile.city_name && <span>- {profile.city_name}</span>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-8">
        {profile.bio && (
          <div className="w-full text-center text-base mt-2 text-muted-foreground">
            {profile.bio}
          </div>
        )}
        {/* Contact Info */}
        {profile.show_contact_info && profile.contact_info && profile.contact_info.length > 0 && (
          <div className="w-full mt-4">
            <div className="font-semibold mb-2 text-center">Contact Information</div>
            <div className="flex flex-col gap-2 items-center">
              {profile.contact_info.map((item) => (
                <div key={item.uuid} className="flex items-center gap-2 text-sm bg-muted rounded px-3 py-2">
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
        {/* Registration date */}
        {profile.registration_date && (
          <div className="text-xs text-muted-foreground mt-6">Member since {new Date(profile.registration_date).toLocaleDateString()}</div>
        )}
      </CardContent>
    </Card>
  );
} 