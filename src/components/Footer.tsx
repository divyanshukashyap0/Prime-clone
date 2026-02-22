import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="px-4 md:px-12 py-16 bg-[#0f171e] text-[#8197a4]">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="mb-8">
          <Link to="/">
            <img
              src="/logo.png"
              alt="Prime Video"
              className="h-8 opacity-70 hover:opacity-100 transition-opacity mx-auto"
            />
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium mb-8">
          <Link to="/legal/terms" className="text-primary hover:underline">Terms and Privacy Notice</Link>
          <Link to="/legal/feedback" className="text-primary hover:underline">Send us feedback</Link>
          <Link to="/legal/help" className="text-primary hover:underline">Help</Link>
          <span className="text-[#425261]">© 1996-2026, Amazon.com, Inc. or its affiliates</span>
        </div>

        <p className="text-xs max-w-2xl leading-relaxed opacity-50">
          Prime Video and all related logos are trademarks of Amazon.com, Inc. or its affiliates.
          Availability of content varies by country and subscription plan.
          Some titles require an additional purchase.
        </p>
      </div>
    </footer>
  );
}
