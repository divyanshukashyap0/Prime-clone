import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top on every route change,
 * EXCEPT within the Admin Dashboard (/admin) where tab
 * switching should preserve scroll position.
 */
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Admin dashboard preserves its scroll position between tab switches
        if (pathname.startsWith("/admin")) return;
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);

    return null;
}
