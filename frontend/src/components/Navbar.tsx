import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-background fixed top-0 left-0 right-0 z-50 ">
      {/* Left side - Logo and Name */}
      <Link to={"/"}>
        <div className="flex items-center gap-1 cursor-pointer">
          <span className="text-2xl font-semibold text-foreground">Crisp</span>

          <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              AI
            </span>
          </div>
        </div>
      </Link>

      {/* Right side - Tabs */}
      <Tabs defaultValue="home" className="w-auto ">
        <TabsList>
          <TabsTrigger value="home" className="cursor-pointer">
            <Link to="/">Interviewee</Link>
          </TabsTrigger>
          <TabsTrigger value="about" className="cursor-pointer">
            <Link to="/Interviewer">Interviewer</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </nav>
  );
}
