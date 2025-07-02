"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const sidebarLinks = [
  { label: "Overview", active: true },
  { label: "View your Ads" },
  { label: "Plans & Billing" },
  { label: "Royalty Club" },
  { label: "Account Settings" },
  { label: "Sign Out" },
];

const Profile = () => {
  // Placeholder state for form fields
  const form = {
    firstName: "John",
    lastName: "Doe",
    company: "Hajjarbashi",
    location: "China",
    email: "example@domain.com",
    phone: "+989376544675",
    description: "Lorem Ipsum is dummy text...",
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-card flex flex-col items-center py-8 px-6 gap-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src="https://placehold.co/800.png?text=Hajjar+Bashi&font=poppins"
              alt="John Doe"
            />
            <AvatarFallback className="text-2xl font-semibold">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="text-lg font-semibold">John Doe</div>
          <div className="text-sm text-muted-foreground">email@example.com</div>
        </div>
        <nav className="w-full mt-4">
          <ul className="flex flex-col gap-1">
            {sidebarLinks.map((link) => (
              <li key={link.label}>
                <Button
                  variant={link.active ? "default" : "ghost"}
                  className="w-full justify-start rounded-md px-4 py-2 text-base"
                >
                  {link.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-8">
        <form className="w-full max-w-3xl bg-card rounded-xl border p-8 flex flex-col gap-8">
          {/* Change Avatar */}
          <section className="flex flex-col items-center gap-2 border-b pb-8">
            <div className="text-base font-semibold w-full text-left mb-2">
              Change Avatar
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src="https://placehold.co/800.png?text=Hajjar+Bashi&font=poppins"
                  alt="Avatar"
                />
                <AvatarFallback className="text-2xl font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                <span className="text-primary font-medium cursor-pointer">
                  Click here
                </span>{" "}
                to upload your file or drag.
                <br />
                <span className="text-xs text-muted-foreground">
                  Supported Format: SVG, JPG, PNG (10mb each)
                </span>
              </span>
            </div>
          </section>
          {/* Account Information */}
          <section className="grid grid-cols-2 gap-6">
            <div className="col-span-2 text-base font-semibold mb-2">
              Account Information
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">First Name</label>
              <Input value={form.firstName} readOnly />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input value={form.lastName} readOnly />
            </div>
            <div className="flex flex-col gap-2 col-span-1">
              <label className="text-sm font-medium">Company Name</label>
              <Input value={form.company} readOnly />
            </div>
            <div className="flex flex-col gap-2 col-span-1">
              <label className="text-sm font-medium">Location</label>
              <Select defaultValue={form.location}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="China">China</SelectItem>
                  <SelectItem value="Malaysia">Malaysia</SelectItem>
                  <SelectItem value="Iran">Iran</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>
          {/* Display Information */}
          <section className="grid grid-cols-2 gap-6">
            <div className="col-span-2 text-base font-semibold mb-2">
              Display Information
            </div>
            <div className="flex flex-col gap-2 col-span-1">
              <label className="text-sm font-medium">Email</label>
              <Input value={form.email} readOnly />
            </div>
            <div className="flex flex-col gap-2 col-span-1">
              <label className="text-sm font-medium">Phone Number</label>
              <PhoneInput value={form.phone} readOnly />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                readOnly
                maxLength={300}
                className="resize-none min-h-24"
              />
              <div className="text-xs text-muted-foreground text-right">
                {form.description.length}/300
              </div>
            </div>
          </section>
          <Button
            type="submit"
            className="w-full h-12 rounded-full text-lg mt-4"
          >
            Save
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Profile;
