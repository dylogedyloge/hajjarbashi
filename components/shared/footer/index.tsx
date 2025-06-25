import { Facebook, Instagram, Linkedin, X } from "lucide-react";

const Footer = () => {
  return (
    <footer className="hidden sm:block w-full border-t border bg-background pt-8 pb-4 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-4">
          {/* Stock Images */}
          <div className="flex flex-row gap-4 md:mr-8">
            <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-lg font-medium">
              Stock Image
            </div>
            <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-lg font-medium">
              Stock Image
            </div>
          </div>
          {/* Footer Columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-2 text-foreground">
                Useful Links
              </h4>
              <ul className="space-y-1 text-sm text-foreground">
                <li>Lorem Ipsum</li>
                <li>Lorem Ipsum</li>
                <li>Lorem Ipsum</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-foreground">
                Documentation
              </h4>
              <ul className="space-y-1 text-sm text-foreground">
                <li>https://docs.example.com</li>
                <li>Comprehensive guides and resources</li>
                <li>Access for all users</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-foreground">Support</h4>
              <ul className="space-y-1 text-sm text-foreground">
                <li>https://support.example.com</li>
                <li>Get help from our support team</li>
                <li>Available 24/7</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-foreground">
                Community Forum
              </h4>
              <ul className="space-y-1 text-sm text-foreground">
                <li>https://forum.example.com</li>
                <li>Join discussions with other users</li>
                <li>Share tips and tricks</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border my-8" />
        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-foreground">@ by Me</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-foreground">Follow Us</span>
            <a
              href="#"
              className="rounded-full border border w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={18} className="text-foreground" />
            </a>
            <a
              href="#"
              className="rounded-full border border w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} className="text-foreground" />
            </a>
            <a
              href="#"
              className="rounded-full border border w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="X"
            >
              <X size={18} className="text-foreground" />
            </a>
            <a
              href="#"
              className="rounded-full border border w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} className="text-foreground" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
